const axios = require('axios');

const JDOODLE_CLIENT_IDS = (process.env.JDOODLE_CLIENT_IDS || process.env.JDOODLE_CLIENT_ID || '').split(',').map(s => s.trim()).filter(Boolean);
const JDOODLE_CLIENT_SECRETS = (process.env.JDOODLE_CLIENT_SECRETS || process.env.JDOODLE_CLIENT_SECRET || '').split(',').map(s => s.trim()).filter(Boolean);
const JDOODLE_API_URL = 'https://api.jdoodle.com/v1/execute';

// JDoodle uses language name + versionIndex. We map our language keys to JDoodle's expected values.
const getLanguageConfig = (lang) => {
  const languages = {
    "c++": { language: "cpp17", versionIndex: "0" },
    "java": { language: "java", versionIndex: "4" },
    "python": { language: "python3", versionIndex: "4" },
    "bash": { language: "bash", versionIndex: "0" }
  };

  return languages[lang.toLowerCase()] || null;
};

/**
 * Execute code using the JDoodle API.
 * JDoodle runs code synchronously — no tokens, no polling needed.
 * 
 * @param {string} language - e.g. "javascript", "c++", "java", "python"
 * @param {string} sourceCode - The full source code to execute
 * @param {string} stdin - The input to feed via stdin
 * @returns {object} - JDoodle's response: { output, statusCode, memory, cpuTime, isExecutionSuccess }
 */
const executeCode = async (language, sourceCode, stdin = '') => {
  const langConfig = getLanguageConfig(language);

  if (!langConfig) {
    throw new Error(`Unsupported language: ${language}`);
  }

  if (JDOODLE_CLIENT_IDS.length === 0 || JDOODLE_CLIENT_SECRETS.length === 0) {
      throw new Error('JDoodle credentials are missing in environment variables');
  }

  const payload = {
    script: sourceCode,
    language: langConfig.language,
    versionIndex: langConfig.versionIndex,
    stdin: stdin
  };

  let lastError = null;

  for (let i = 0; i < JDOODLE_CLIENT_IDS.length; i++) {
    try {
        const currentPayload = {
            ...payload,
            clientId: JDOODLE_CLIENT_IDS[i],
            clientSecret: JDOODLE_CLIENT_SECRETS[i]
        };

        const response = await axios.post(JDOODLE_API_URL, currentPayload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        });

        // JDoodle might return a 200 OK but with an error message like "Daily Limit Reached"
        if (response.data && response.data.error && response.data.error.toLowerCase().includes('limit')) {
            console.warn(`JDoodle key index ${i} limit reached: ${response.data.error}. Trying next...`);
            lastError = new Error(response.data.error);
            continue;
        }

        return response.data;
    } catch (error) {
        lastError = error;
        // Check if error is related to rate limiting, authentication, or server error (401, 403, 429, 500+)
        if (error.response && [401, 403, 429].includes(error.response.status) || (error.response && error.response.status >= 500)) {
            console.warn(`JDoodle key index ${i} failed with status ${error.response.status}. Trying next...`);
            continue;
        }
        throw error;
    }
  }

  throw lastError || new Error("All JDoodle API keys exhausted or failed.");
};

/**
 * Evaluate a submission against all test cases using the JDoodle API.
 * Runs each test case one at a time (JDoodle doesn't support batch mode).
 * 
 * Returns a Judge0-compatible response format so the controller layer doesn't need changes:
 *   { status: { id: 3, description: "Accepted" } }           — All passed
 *   { status: { id: 4, description: "Wrong Answer" }, ... }   — A test case failed
 *   { status: { id: 11, description: "Runtime Error" }, stderr: "..." }            — Runtime error
 */
const evaluateSubmission = async (language, completeCode, allTestCases) => {



  let ext = '';
  let compileCmd = '';
  let runCmd = '';

  if (language.toLowerCase() === 'c++') {
    ext = 'cpp';
    compileCmd = 'g++ -O2 -std=c++14 source.cpp -o solution';
    runCmd = './solution';
  } else if (language.toLowerCase() === 'java') {
    ext = 'java';
    compileCmd = 'javac Main.java';
    runCmd = 'java Main';
  } else if (language.toLowerCase() === 'python') {
    ext = 'py';
    compileCmd = '';
    runCmd = 'python3 source.py';
  } else {
    return {
      status: { id: 13, description: "Internal Error" },
      compile_output: "Invalid language provided."
    };
  }

  let bashScript = `
cat << 'EOF_CODE' > ${ext === 'java' ? 'Main.java' : 'source.' + ext}
${completeCode.replace(/'EOF_CODE'/g, "EOF_CODE")}
EOF_CODE
`;

  if (compileCmd) {
    bashScript += `
${compileCmd} 2> compile_err.txt
if [ $? -ne 0 ]; then
    echo -n "COMPILATION_ERROR|"
    cat compile_err.txt
    exit 0
fi
`;
  }

  bashScript += `\nTOTAL_START=$(date +%s%3N)\n`;

for (let i = 0; i < allTestCases.length; i++) {
    const testCase = allTestCases[i];
    bashScript += `
cat << 'EOF_INPUT_${i}' > input_${i}.txt
${testCase.input.replace(new RegExp(`'EOF_INPUT_${i}'`, 'g'), `EOF_INPUT_${i}`)}
EOF_INPUT_${i}

/usr/bin/time -f "%M" -o mem_${i}.txt timeout 2s ${runCmd} < input_${i}.txt > out_${i}.txt 2> err_${i}.txt
EXIT_CODE=$?
if [ $EXIT_CODE -eq 124 ]; then
    echo -n "TIME_LIMIT_EXCEEDED|"
    echo -n "---TEST_CASE_DELIMITER---"
    TOTAL_END=$(date +%s%3N)
    MAX_MEM=$(cat mem_*.txt 2>/dev/null | sort -nr | head -n1)
    echo -n "---TOTAL_MEM---$MAX_MEM"
    echo -n "---TOTAL_TIME---$((TOTAL_END - TOTAL_START))"
    exit 0
elif [ $EXIT_CODE -ne 0 ]; then
    echo -n "RUNTIME_ERROR|"
    cat err_${i}.txt
    echo -n "---TEST_CASE_DELIMITER---"
    TOTAL_END=$(date +%s%3N)
    MAX_MEM=$(cat mem_*.txt 2>/dev/null | sort -nr | head -n1)
    echo -n "---TOTAL_MEM---$MAX_MEM"
    echo -n "---TOTAL_TIME---$((TOTAL_END - TOTAL_START))"
    exit 0
else
    cat out_${i}.txt
fi
echo -n "---TEST_CASE_DELIMITER---"
`;
  }

  bashScript += `
TOTAL_END=$(date +%s%3N)
MAX_MEM=$(cat mem_*.txt 2>/dev/null | sort -nr | head -n1)
echo -n "---TOTAL_MEM---$MAX_MEM"
echo -n "---TOTAL_TIME---$((TOTAL_END - TOTAL_START))"
`;

  try {
    const result = await executeCode("bash", bashScript, "");

    if (result.isExecutionSuccess === false) {
      return {
        status: { id: 11, description: "Runtime/Compilation Error" },
        compile_output: result.output,
        stderr: result.output,
        stdout: null
      };
    }

    let finalOutput = result.output;
    let executionTimeMs = null;
    let memoryKb = null;

    if (finalOutput && finalOutput.includes("---TOTAL_TIME---")) {
        const parts = finalOutput.split("---TOTAL_TIME---");
        finalOutput = parts[0];
        executionTimeMs = parseInt(parts[1], 10);
    }
    
    if (finalOutput && finalOutput.includes("---TOTAL_MEM---")) {
        const memParts = finalOutput.split("---TOTAL_MEM---");
        finalOutput = memParts[0];
        memoryKb = parseInt(memParts[1], 10);
    }

    if (finalOutput.startsWith("COMPILATION_ERROR|")) {
        return {
          status: { id: 11, description: "Compilation Error" },
          compile_output: finalOutput.substring("COMPILATION_ERROR|".length),
          stderr: finalOutput,
          stdout: null,
          executionTime: 0,
          memory: 0
        };
    }

    const outputs = finalOutput.split('---TEST_CASE_DELIMITER---');
    
    for (let i = 0; i < allTestCases.length; i++) {
      const outputSegment = outputs[i];
      if (outputSegment === undefined) break; // Exited early due to runtime error or TLE

      if (outputSegment.startsWith("TIME_LIMIT_EXCEEDED|")) {
        return {
          status: { id: 12, description: "Time Limit Exceeded" },
          stderr: "Time Limit Exceeded (Custom 2s Timeout)",
          testCase: i + 1,
          executionTime: executionTimeMs,
          memory: memoryKb
        };
      }
      
      if (outputSegment.startsWith("RUNTIME_ERROR|")) {
         return {
           status: { id: 11, description: "Runtime Error" },
           stderr: outputSegment.substring("RUNTIME_ERROR|".length),
           testCase: i + 1,
           executionTime: executionTimeMs,
           memory: memoryKb
         };
      }
      
      const actualOutput = outputSegment.trim();
      const expectedOutput = (allTestCases[i].output || '').trim();

      if (actualOutput !== expectedOutput) {
        return {
          status: { id: 4, description: "Wrong Answer" },
          compile_output: null,
          stdout: actualOutput,
          expected_output: expectedOutput,
          testCase: i + 1,
          executionTime: executionTimeMs,
          memory: memoryKb
        };
      }
    }

    return { 
        status: { id: 3, description: "Accepted" },
        executionTime: executionTimeMs,
        memory: memoryKb
    };

  } catch (err) {
    console.error("JDoodle API error during batch execution:", err.message);
    return {
      status: { id: 13, description: "Internal Error" },
      compile_output: `Execution engine error: ${err.message}`
    };
  }
};

module.exports = { getLanguageConfig, executeCode, evaluateSubmission };
