const { evaluateSubmission } = require("../utilis/problemUtility");
const Problem = require("../model/problem");
const User = require("../model/user");
const Submission = require("../model/submission");

// Create a new problem (Admin only, verifies reference solutions)
const createProblem = async (req, res) => {
    const { title, description, difficulty, tags, visibleTestCases, hiddenTestCases,
        referenceSolution, startCode } = req.body;

    try {
        const allTestCases = [...visibleTestCases, ...hiddenTestCases];

        if (!referenceSolution || referenceSolution.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one reference solution is required to verify the test cases."
            });
        }

        for (const { language, completeCode } of referenceSolution) {
            const result = await evaluateSubmission(language, completeCode, allTestCases);
            if (result.status.id !== 3) { // 3 = Accepted
                return res.status(400).json({
                    success: false,
                    message: `Reference solution verification failed for ${language}! Status: ${result.status.description}`,
                    error: result.compile_output || result.stdout
                });
            }
        }

        const userProblem = await Problem.create({
            ...req.body,
            problemCreator: req.result._id
        });

        return res.status(201).json({
            success: true,
            message: "Problem created successfully",
            data: userProblem
        });

    } catch (err) {
        console.error("Error creating problem:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error during problem creation"
        });
    }
}
//hum jo problem o update krna cgate hai os ko check krneke lye code 
const updateProblem = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }

        const { title, description, difficulty, tags, visibleTestCases, hiddenTestCases,
            referenceSolution, startCode } = req.body;

        // Agar test cases ya reference solution aaye hain toh nayi values se evaluate karo
        if (referenceSolution || visibleTestCases || hiddenTestCases) {
            const allTestCases = [
                ...(visibleTestCases || problem.visibleTestCases),
                ...(hiddenTestCases || problem.hiddenTestCases)
            ];

            const solutionsToVerify = referenceSolution || problem.referenceSolution;

            for (const { language, completeCode } of solutionsToVerify) {
                const result = await evaluateSubmission(language, completeCode, allTestCases);

                if (result.status.id !== 3) { // 3 = Accepted
                    return res.status(400).json({
                        success: false,
                        message: `Reference solution verification failed for ${language}! Status: ${result.status.description}`,
                        error: result.compile_output || result.stdout || result.stderr
                    });
                }
            }
        }

        const updateData = { ...req.body };
        delete updateData._id;
        delete updateData.__v;
        delete updateData.problemCreator;

        // Ye line problem ko update karegi instead of create
        const updatedProblem = await Problem.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { returnDocument: 'after', runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Problem updated successfully",
            data: updatedProblem
        });

    } catch (err) {
        console.error("Error updating problem:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error during problem update",
            error: err.message
        });
    }
}

const deleteProblem = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }
        await Problem.findByIdAndDelete(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Problem deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting problem:", error);
        return res.status(500).json({ success: false, message: "Error deleting problem" });
    }
}

// Get all problems ka sirf list uske baad uske click krne pe baaki detail
const getAllProblems = async (req, res) => {
    try {

        // Pagination setup
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalProblems = await Problem.countDocuments();
        const totalPages = Math.ceil(totalProblems / limit);

        const problems = await Problem.find({})
            .select('_id title difficulty tags')  //this will show sirf etna iske baad e will fetch through its id 
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // Naye problems pehle dikhayega

        return res.status(200).json({
            success: true,
            data: problems,
            pagination: {
                totalProblems,
                totalPages,
                currentPage: page,
                limit
            }
        });
    } catch (err) {
        console.error("Error fetching all problems:", err);
        return res.status(500).json({
            success: false,
            message: "Error fetching problems"
        });
    }
}

// Get specific problem by ID (omits hidden test cases and solutions)
const getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id, '-hiddenTestCases -referenceSolution');
        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }
        return res.status(200).json({
            success: true,
            data: problem
        });
    } catch (err) {
        console.error("Error fetching problem by ID:", err);
        return res.status(500).json({
            success: false,
            message: "Error fetching problem details"
        });
    }
}

// Admin Get specific problem by ID (includes hidden test cases and solutions)
const getAdminProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }
        return res.status(200).json({
            success: true,
            data: problem
        });
    } catch (err) {
        console.error("Error fetching admin problem by ID:", err);
        return res.status(500).json({
            success: false,
            message: "Error fetching problem details"
        });
    }
}

//user ne kittte aur kaunse problem solve kre hai 
const userSolvedProblem = async (req, res) => {
    try {

        const user = await User.findById(req.result._id).populate({
            path: 'problemSolved',
            select: 'id title difficulty tags'
        });

        return res.status(200).json({
            success: true,
            data: user.problemSolved
        });

    } catch (err) {
        console.error("Error fetching user solved problems:", err);
        return res.status(500).json({
            success: false,
            message: "Error fetching user solved problems"
        });
    }
}

//ek particalr problm me kitte submission hai 
const submittedProblems = async (req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.pid;
        const ans = await Submission.find({ userId, problemId });
        if (ans.length == 0) {
            return res.status(200).send("No problem submitted yet");
        }
        return res.status(200).json({
            success: true,
            data: ans
        })

    }
    catch (err) {
        console.error("Error fetching user submitted problems:", err);
        return res.status(500).json({
            success: false,
            message: "Error fetching user submitted problems"
        });
    }
}



module.exports = { createProblem, updateProblem, deleteProblem, getAllProblems, getProblemById, getAdminProblemById, userSolvedProblem, submittedProblems };
