const express = require("express");
const { createProblem, updateProblem, deleteProblem, getAllProblems, getProblemById, getAdminProblemById, userSolvedProblem, submittedProblems } = require("../controllers/userProblem");
const problemRouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const userMiddleware = require("../middleware/userMiddleware");

problemRouter.post("/create", adminMiddleware, createProblem);
problemRouter.patch("/update/:id", adminMiddleware, updateProblem);
problemRouter.delete("/delete/:id", adminMiddleware, deleteProblem);

problemRouter.get("/getallproblems", userMiddleware, getAllProblems);
problemRouter.get("/getbyid/:id", userMiddleware, getProblemById);
problemRouter.get("/admin/getbyid/:id", adminMiddleware, getAdminProblemById);
problemRouter.get("/problemSolvedbyUser",userMiddleware,userSolvedProblem);
problemRouter.get("/submittedProblems/:pid",userMiddleware,submittedProblems);
module.exports = problemRouter;