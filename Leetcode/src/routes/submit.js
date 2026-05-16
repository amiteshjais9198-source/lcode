const express=require("express");
const userMiddleware=require('../middleware/userMiddleware');
const rateLimiter=require("../middleware/rateLimiter");
const submitRouter=express.Router();
const {submitcode,runtestcases}=require('../controller/submission');

submitRouter.post('/submit/:id',userMiddleware,rateLimiter,submitcode);
submitRouter.post('/runcode/:id',userMiddleware,rateLimiter,runtestcases);

module.exports=submitRouter;




