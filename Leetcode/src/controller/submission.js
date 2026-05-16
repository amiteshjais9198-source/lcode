const Submission = require("../model/submission");
const Problem = require("../model/problem");
const axios = require("axios");

// ─── JDoodle Configuration ───
const JDOODLE_API_URL = "https://api.jdoodle.com/v1/execute";
const JDOODLE_CLIENT_ID = process.env.JDOODLE_CLIENT_ID;
const JDOODLE_CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET;

// Map user language selection to JDoodle language identifiers
const getJDoodleLanguage = (lang) => {
    const map = {
        "javascript": { language: "nodejs", versionIndex: "4" },
        "java":       { language: "java",   versionIndex: "4" },
        "cpp":        { language: "cpp17",  versionIndex: "1" },
    };
    return map[lang.toLowerCase()] || map["javascript"];
};

/**
 * Execute code on JDoodle with a single API call.
 * Returns { output, statusCode, memory, cpuTime } or throws.
 */
const executeOnJDoodle = async (code, language, stdin) => {
    const langConfig = getJDoodleLanguage(language);

    const payload = {
        clientId: JDOODLE_CLIENT_ID,
        clientSecret: JDOODLE_CLIENT_SECRET,
        script: code,
        language: langConfig.language,
        versionIndex: langConfig.versionIndex,
        stdin: stdin || "",
    };

    const response = await axios.post(JDOODLE_API_URL, payload, {
        timeout: 30000,
        headers: { "Content-Type": "application/json" },
    });

    return response.data; // { output, statusCode, memory, cpuTime }
};

/**
 * Compare actual output with expected output.
 * Trims trailing whitespace/newlines for a fair comparison.
 */
const compareOutput = (actual, expected) => {
    const clean = (s) => (s || "").trim().replace(/\r\n/g, "\n");
    return clean(actual) === clean(expected);
};

/**
 * Detect if JDoodle returned a compilation or runtime error.
 * JDoodle statusCode 200 = success, anything else = error.
 * Also checks if output contains common error patterns.
 */
const detectError = (jdoodleResult) => {
    if (!jdoodleResult) return { isError: true, message: "No response from execution service" };

    // JDoodle returns statusCode 200 for successful execution
    if (jdoodleResult.statusCode && jdoodleResult.statusCode !== 200) {
        return {
            isError: true,
            message: jdoodleResult.output || `Execution failed (status: ${jdoodleResult.statusCode})`,
        };
    }

    // Check for compilation errors in output
    const output = jdoodleResult.output || "";
    if (output.includes("error:") && output.includes("compilation")) {
        return { isError: true, message: output };
    }

    return { isError: false };
};


// ═══════════════════════════════════════════════
//  POST /api/user/submit/:id — Full Submission
// ═══════════════════════════════════════════════
const submitcode = async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    try {
        const { code, language } = req.body;
        const problem = await Problem.findById(id);

        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        const allTestCases = [...problem.visibleTestCases, ...problem.invisibleTestCases];

        const submit = await Submission.create({
            problem_id: id,
            user_id: userId,
            code: code,
            language: language,
            status: "pending",
            totaltestcases: allTestCases.length,
        });

        let testcasespassed = 0;
        let finalStatus = "accepted";
        let errormessage = null;
        let totalRuntime = 0;
        let totalMemory = 0;

        // Process each test case sequentially via JDoodle
        for (let i = 0; i < allTestCases.length; i++) {
            const test = allTestCases[i];
            console.log(`[JDoodle] Submit — Test Case ${i + 1}/${allTestCases.length}...`);

            try {
                const result = await executeOnJDoodle(code, language, test.input.toString());

                // Check for execution errors
                const errorCheck = detectError(result);
                if (errorCheck.isError) {
                    if (finalStatus === "accepted") {
                        finalStatus = "error";
                        errormessage = errorCheck.message;
                    }
                    // Stop early on compilation errors — saves API credits
                    break;
                }

                // Compare output on our backend
                const actualOutput = result.output || "";
                const expectedOutput = test.output.toString();

                if (compareOutput(actualOutput, expectedOutput)) {
                    testcasespassed++;
                } else {
                    if (finalStatus === "accepted") {
                        finalStatus = "wrong";
                        errormessage = `Wrong Answer on test case ${i + 1}`;
                    }
                }

                // Accumulate runtime/memory
                totalRuntime += parseFloat(result.cpuTime) || 0;
                totalMemory += parseInt(result.memory) || 0;

            } catch (e) {
                console.error(`[JDoodle] Submit TC ${i + 1} Error:`, e.message);
                if (finalStatus === "accepted") {
                    finalStatus = "error";
                    errormessage = "Execution Service Timeout";
                }
                break; // Stop early on service errors too
            }
        }

        // Save results
        submit.status = finalStatus;
        submit.runtime = Math.round(totalRuntime * 100) / 100;
        submit.memory = totalMemory;
        submit.testcasespassed = testcasespassed;
        submit.errormessage = errormessage;
        await submit.save();

        // Mark problem as solved if all passed
        if (finalStatus === "accepted" && !req.user.problemSolved.includes(id)) {
            req.user.problemSolved.push(id);
            await req.user.save();
        }

        console.log(`[JDoodle] Submit complete: ${finalStatus} (${testcasespassed}/${allTestCases.length})`);
        res.status(200).send(submit);

    } catch (err) {
        console.error("Submit Error:", err);
        res.status(500).send("Internal Server Error");
    }
};


// ═══════════════════════════════════════════════
//  POST /api/user/runcode/:id — Run Visible Tests
// ═══════════════════════════════════════════════
const runtestcases = async (req, res) => {
    const { id } = req.params;

    try {
        const { code, language } = req.body;
        const problem = await Problem.findById(id);

        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        const testResults = [];

        // Run each visible test case through JDoodle
        for (let i = 0; i < problem.visibleTestCases.length; i++) {
            const test = problem.visibleTestCases[i];
            console.log(`[JDoodle] Run — Test Case ${i + 1}/${problem.visibleTestCases.length}...`);

            try {
                const result = await executeOnJDoodle(code, language, test.input.toString());

                const errorCheck = detectError(result);
                const actualOutput = (result.output || "").trim();
                const expectedOutput = test.output.toString().trim();

                // Determine status: 3 = Accepted, 4 = Wrong Answer, 6 = Compilation Error, 11 = Runtime Error
                let status_id;
                if (errorCheck.isError) {
                    status_id = actualOutput.toLowerCase().includes("error:") ? 6 : 11;
                } else if (compareOutput(actualOutput, expectedOutput)) {
                    status_id = 3; // Accepted
                } else {
                    status_id = 4; // Wrong Answer
                }

                testResults.push({
                    stdin: test.input,
                    expected_output: test.output,
                    stdout: actualOutput,
                    status_id: status_id,
                    stderr: errorCheck.isError ? errorCheck.message : "",
                });

            } catch (e) {
                console.error(`[JDoodle] Run TC ${i + 1} Error:`, e.message);
                testResults.push({
                    stdin: test.input,
                    expected_output: test.output,
                    stdout: "",
                    status_id: 12,
                    stderr: "Execution Timeout or Service Error",
                });
            }
        }

        // Build final response matching the existing frontend contract
        const finalResponse = {
            status_id: testResults.every((r) => r.status_id === 3) ? 3 : 4,
            time: "0",
            memory: "0",
            testCases: testResults,
        };

        console.log("[JDoodle] All visible test cases completed.");
        return res.status(200).json(finalResponse);

    } catch (err) {
        console.error("Run Error:", err);
        return res.status(500).json({ success: false, message: "Backend error" });
    }
};

module.exports = { submitcode, runtestcases };