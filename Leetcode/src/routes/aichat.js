const express=require("express");
const aiRouter=express.Router();
const userMiddleware=require('../middleware/userMiddleware');
const solveDoubt=require("../controller/aichatting");

aiRouter.post('/chat',userMiddleware,solveDoubt);

module.exports=aiRouter;