const express=require("express");
const airouter=express.Router();
const userMiddleware=require("../middleware/userMiddleware")
const solveDoubt=require("../controllers/solveDoubt");
const { strictLimiter } = require("../middleware/rateLimiter");

airouter.post("/chat", strictLimiter, userMiddleware,solveDoubt);


module.exports=airouter;