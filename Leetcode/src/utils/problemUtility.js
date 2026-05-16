const axios = require('axios');

// ─── JDoodle Configuration ───
const JDOODLE_API_URL = "https://api.jdoodle.com/v1/execute";

// ─── JDoodle Language Mapping ───
const getLanguageConfig = (lang) => {
    const languageMap = {
        "c++":        { language: "cpp17",  versionIndex: "1", displayName: "C++ 17" },
        "cpp":        { language: "cpp17",  versionIndex: "1", displayName: "C++ 17" },
        "java":       { language: "java",   versionIndex: "4", displayName: "Java 17" },
        "javascript": { language: "nodejs", versionIndex: "4", displayName: "Node.js 17" },
        "node":       { language: "nodejs", versionIndex: "4", displayName: "Node.js 17" },
        "nodejs":     { language: "nodejs", versionIndex: "4", displayName: "Node.js 17" },
        "python":     { language: "python3",versionIndex: "4", displayName: "Python 3.11" },
    };
    return languageMap[lang.toLowerCase()] || null;
};

// Returns JDoodle language identifier string (e.g., "cpp17", "nodejs")
const getLanguageId = (lang) => {
    const config = getLanguageConfig(lang);
    return config ? config.language : null;
};

// ─── Status Mapping (backward compatibility with frontend) ───
const checkstatus = [
    { "id": 1,  "description": "In Queue" },
    { "id": 2,  "description": "Processing" },
    { "id": 3,  "description": "Accepted" },
    { "id": 4,  "description": "Wrong Answer" },
    { "id": 5,  "description": "Time Limit Exceeded" },
    { "id": 6,  "description": "Compilation Error" },
    { "id": 7,  "description": "Runtime Error (SIGSEGV)" },
    { "id": 8,  "description": "Runtime Error (SIGXFSZ)" },
    { "id": 9,  "description": "Runtime Error (SIGFPE)" },
    { "id": 10, "description": "Runtime Error (SIGABRT)" },
    { "id": 11, "description": "Runtime Error (NZEC)" },
    { "id": 12, "description": "Runtime Error (Other)" },
    { "id": 13, "description": "Internal Error" },
    { "id": 14, "description": "Exec Format Error" }
];

const statusresult = (status_id) => {
    const status = checkstatus.find(item => item.id === status_id);
    return status ? status.description : "Invalid status id";
};

// ─── In-memory cache for batch results ───
const _resultCache = new Map();
let _tokenCounter = 0;

/**
 * Get JDoodle language config from a JDoodle language string.
 * submitBatch receives `language` as JDoodle identifier (e.g., "cpp17").
 */
const getConfigFromJDoodleLang = (jdoodleLang) => {
    const map = {
        "cpp17":   { language: "cpp17",   versionIndex: "1" },
        "java":    { language: "java",    versionIndex: "4" },
        "nodejs":  { language: "nodejs",  versionIndex: "4" },
        "python3": { language: "python3", versionIndex: "4" },
    };
    return map[jdoodleLang] || { language: jdoodleLang, versionIndex: "0" };
};

/**
 * Execute a single test case on JDoodle.
 * Returns { output, statusCode, memory, cpuTime }
 */
const executeOnJDoodle = async (code, jdoodleLang, stdin) => {
    const langConfig = getConfigFromJDoodleLang(jdoodleLang);

    const payload = {
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET,
        script: code,
        language: langConfig.language,
        versionIndex: langConfig.versionIndex,
        stdin: stdin || "",
    };

    const response = await axios.post(JDOODLE_API_URL, payload, {
        timeout: 30000,
        headers: { "Content-Type": "application/json" },
    });

    return response.data;
};

/**
 * submitBatch — JDoodle replacement for Judge0 batch API.
 *
 * Takes an array of submissions:
 *   [{ source_code, language, stdin, expected_output }, ...]
 *
 * Executes each on JDoodle, compares output, caches results,
 * and returns an array of { token } for backward compatibility.
 *
 * OPTIMIZATION: Stops on first compilation error to save API credits.
 */
const submitBatch = async (submissions) => {
    const tokens = [];
    let compilationFailed = false;

    for (let i = 0; i < submissions.length; i++) {
        const sub = submissions[i];
        const token = `jdoodle_${++_tokenCounter}_${Date.now()}`;

        if (compilationFailed) {
            // Skip remaining test cases if compilation already failed
            _resultCache.set(token, {
                status_id: 6,
                stdout: "",
                stderr: "Skipped — compilation error on earlier test case",
            });
            tokens.push({ token });
            continue;
        }

        try {
            console.log(`[JDoodle Batch] Executing TC ${i + 1}/${submissions.length}...`);
            const result = await executeOnJDoodle(sub.source_code, sub.language, sub.stdin?.toString() || "");

            const output = (result.output || "").trim();
            const expected = (sub.expected_output || "").toString().trim().replace(/\r\n/g, "\n");
            const actual = output.replace(/\r\n/g, "\n");

            // Detect compilation / runtime errors
            if (result.statusCode && result.statusCode !== 200) {
                const isCompileError = output.toLowerCase().includes("error");
                _resultCache.set(token, {
                    status_id: isCompileError ? 6 : 11,
                    stdout: actual,
                    stderr: output,
                });
                if (isCompileError) compilationFailed = true;
            } else if (output.toLowerCase().includes("error:") && output.toLowerCase().includes("compilation")) {
                _resultCache.set(token, {
                    status_id: 6,
                    stdout: "",
                    stderr: output,
                });
                compilationFailed = true;
            } else if (actual === expected) {
                _resultCache.set(token, {
                    status_id: 3, // Accepted
                    stdout: actual,
                    stderr: "",
                });
            } else {
                _resultCache.set(token, {
                    status_id: 4, // Wrong Answer
                    stdout: actual,
                    stderr: "",
                });
            }
        } catch (err) {
            console.error(`[JDoodle Batch] TC ${i + 1} Error:`, err.message);
            _resultCache.set(token, {
                status_id: 13, // Internal Error
                stdout: "",
                stderr: err.message,
            });
        }

        tokens.push({ token });
    }

    return tokens;
};

/**
 * submitoken — JDoodle replacement for Judge0 token polling.
 *
 * Takes an array of tokens and returns cached results:
 *   [{ status_id, stdout, stderr }, ...]
 *
 * Since JDoodle is synchronous, results are already available
 * from the submitBatch call — no polling needed.
 */
const submitoken = async (tokens) => {
    const results = [];

    for (const token of tokens) {
        const cached = _resultCache.get(token);
        if (cached) {
            results.push(cached);
            _resultCache.delete(token); // Cleanup
        } else {
            results.push({
                status_id: 13,
                stdout: "",
                stderr: "Result not found for token",
            });
        }
    }

    return results;
};

/**
 * Check remaining JDoodle API credits for the day.
 */
const checkCredits = async () => {
    try {
        const response = await axios.post("https://api.jdoodle.com/v1/credit-spent", {
            clientId: process.env.JDOODLE_CLIENT_ID,
            clientSecret: process.env.JDOODLE_CLIENT_SECRET,
        });
        return response.data;
    } catch (err) {
        console.error("JDoodle credit check failed:", err.message);
        return null;
    }
};

module.exports = { getLanguageId, getLanguageConfig, statusresult, checkCredits, submitBatch, submitoken };
