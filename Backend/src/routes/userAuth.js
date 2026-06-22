const express = require("express");
const authRouter = express.Router();
const { register, login, logout, adminRegister, deleteProfile } = require("../controllers/userAuthentication");
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const Problem = require("../model/problem");
const { authLimiter } = require("../middleware/rateLimiter");


// register
// login
// logout
// getprofile

authRouter.post("/register", authLimiter, register);
authRouter.post('/login', authLimiter, login);
authRouter.post('/logout', userMiddleware, logout);   //usermiddleware ye chcek krta hai ki Agar user properly authenticated hai AND logout nahi hua hai tabhi next route pe jaane do
authRouter.post('/admin/register', authLimiter, adminMiddleware, adminRegister)
authRouter.delete('/profile', userMiddleware, deleteProfile);

authRouter.get("/check",userMiddleware, async (req,res)=>{
    await req.result.populate('problemSolved');
    const totalProblems = await Problem.countDocuments();
    const reply={
        firstName:req.result.firstName,
        emailId:req.result.emailId,
        _id:req.result._id,
        problemSolved: req.result.problemSolved || [],
        totalProblems,
        role: req.result.role
    }
    res.status(200).json({
        success:true,
        reply
    })
    
    
})
// authRouter.get('/getProfile',getProfile)

module.exports = authRouter;