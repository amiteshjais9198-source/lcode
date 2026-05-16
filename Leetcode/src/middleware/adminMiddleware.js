const jwt=require("jsonwebtoken");
const User=require("../model/user");
const redisClient=require("../config/redis");
const adminMiddleware=async (req,res,next)=>{
    const {token}=req.cookies;
    if(!token){
        throw new Error("user not found");
    }
    const payLoad=jwt.verify(token,process.env.Secret_Key);
    const user=await User.findOne({emailId:payLoad.emailId});
    if(!user){
        throw new Error("user not found");
    }
    if(user.role!="admin"){
        throw new Error("Invalid user");
    }
    const isBlocked=await redisClient.get(`token:${token}`);
    if(isBlocked){
        throw new Error("invalid token");
    }
    req.user=user;
    next();
}

module.exports=adminMiddleware;