const Problem = require("../model/problem");
const Submission = require("../model/submission");
const { evaluateSubmission } = require("../utilis/problemUtility");

const submitCode = async (req, res) => {
    try {
        const { language, code } = req.body;
        const userid = req.result._id;
        const problemid = req.params._id; 

        if (!userid || !problemid || !code || !language) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // fetching the problem from the database so we can check for the testcases etc
        const problem = await Problem.findById(problemid);
        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }

        const allTestCases = [...problem.visibleTestCases, ...problem.hiddenTestCases];

        // before the submission we are creating a pending status db 
        const submitresult = await Submission.create({
            userId: userid,
            problemId: problemid,
            code: code,
            language: language,
            status: "pending",
            testCasesPassed: 0,
            testCasesTotal: allTestCases.length, // Updated to use all testcases
        });

        // ab compile krenge check krke uska result update kar denge
        const result = await evaluateSubmission(language, code, allTestCases);

        // Calculate passed test cases and final status
        let passed = 0;
        let finalStatus = result.status.description;
        let dbStatus = "error";

        if (result.status.id === 3) { // 3 = Accepted
            passed = allTestCases.length;
            dbStatus = "accepted";
        } else if (result.status.id === 4) { // 4 = Wrong Answer
            passed = result.testCase ? result.testCase - 1 : 0;
            dbStatus = "wrong";
        } else if (result.status.description === "Time Limit Exceeded") { // JDoodle custom TLE
            passed = result.testCase ? result.testCase - 1 : 0;
            dbStatus = "error";
        } else if (result.testCase) {
            // JDoodle/Utility testCase returned is 1-indexed (e.g., failed on test case 2 means 1 passed)
            passed = result.testCase - 1; 
            dbStatus = "error";
        }

        // Update DB with final result
        // this also gives the status if testcase not passed 
        submitresult.status = dbStatus;
        submitresult.testCasesPassed = passed;
        
        // Save the parsed bash execution time (if available, else 0)
        submitresult.runtime = result.executionTime || 0;
        
        // Save the parsed peak memory (if available, else 0)
        submitresult.memory = result.memory || 0;
        
        await submitresult.save();

        // If Accepted, append problem ID to user's solved list (if not already present)
        if (result.status.id === 3) {
            const user = req.result;
            if (!user.problemSolved.includes(problemid)) {
                user.problemSolved.push(problemid);
                await user.save();
            }
        }

        return res.status(200).json({
            success: true,
            data: {
                submissionId: submitresult._id,
                status: finalStatus,
                runtime:result.executionTime,
                testCasesPassed: passed,
                totalTestCases: allTestCases.length,
                details: result // Includes expected output, standard output, error messages, etc.
            }
        });

    }
    catch (err) {
        console.error("Error executing user submission:", err);
        return res.status(500).json({
            success: false,
            message: "Internal error processing submission"
        });
    }
}

const runCode= async(req,res)=>{
 try {
        const { language, code } = req.body;
        const userid = req.result._id;
        const problemid = req.params._id; 

        if (!userid || !problemid || !code || !language) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // fetching the problem from the database so we can check for the testcases etc
        const problem = await Problem.findById(problemid);
        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }

        const allTestCases = [...problem.visibleTestCases];
        // ab compile krenge check krke uska result update kar denge
        const result = await evaluateSubmission(language, code, allTestCases);

        // Calculate passed test cases and final status
        let passed = 0;
        let finalStatus = result.status.description;
        let dbStatus = "error";

        if (result.status.id === 3) { // 3 = Accepted
            passed = allTestCases.length;
            dbStatus = "accepted";
        } else if (result.status.id === 4) { // 4 = Wrong Answer
            passed = result.testCase ? result.testCase - 1 : 0;
            dbStatus = "wrong";
        } else if (result.status.description === "Time Limit Exceeded") { // JDoodle custom TLE
            passed = result.testCase ? result.testCase - 1 : 0;
            dbStatus = "error";
        } else if (result.testCase) {
            // JDoodle/Utility testCase returned is 1-indexed (e.g., failed on test case 2 means 1 passed)
            passed = result.testCase - 1; 
            dbStatus = "error";
        }

       
        return res.status(200).json({
            success: true,
            data: {
                status: finalStatus,
                runtime:result.executionTime,
                testCasesPassed: passed,
                totalTestCases: allTestCases.length,
                details: result // Includes expected output, standard output, error messages, etc.
            }
        });

    }
    catch (err) {
        console.error("Error executing user submission:", err);
        return res.status(500).json({
            success: false,
            message: "Internal error processing submission"
        });
    }
}

module.exports = {submitCode,runCode};