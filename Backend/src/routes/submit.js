const express=require("express");
const userMiddleware = require("../middleware/userMiddleware");
const {submitCode,runCode}=require("../controllers/usersubmitCode");
const { strictLimiter } = require("../middleware/rateLimiter");


const submitRouter = express.Router();
submitRouter.post("/submit/:_id", strictLimiter, userMiddleware, submitCode);
submitRouter.post("/run/:_id", strictLimiter, userMiddleware, runCode)


module.exports=submitRouter;
