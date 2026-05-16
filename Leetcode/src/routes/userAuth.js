const express=require("express");
const authRouter=express.Router();
const userMiddleware=require('../middleware/userMiddleware');
const adminMiddleware=require('../middleware/adminMiddleware');
const {
  register,
  login,
  logout,
  getProfile,
  adminRegister,
  deleteProfile,
  searchUser,
} = require('../controller/userAuthent');
authRouter.post('/register',register);
authRouter.post('/Admin/register',adminMiddleware,adminRegister);
authRouter.post('/login',login);
authRouter.post('/logout',logout);
authRouter.get('/getuser/:id',searchUser);
authRouter.get('/getProfile',userMiddleware,getProfile);
authRouter.delete('/deleteuser',userMiddleware,deleteProfile);
authRouter.get('/check',userMiddleware,(req,res)=>{
     const reply={
      firstName:req.user.firstName,
      emailId:req.user.emailId,
      _id:req.user._id,
      role:req.user.role
     }
     res.status(200).json({
       user:reply,
       message:"user account openend"
     });
})
module.exports=authRouter;




