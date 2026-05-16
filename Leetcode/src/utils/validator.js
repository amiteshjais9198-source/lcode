const validate=require('validator');

const validator=async (req)=>{
     const {emailId,password}  = req.body;
     if(!emailId||!validate.isEmail(emailId)){
        throw new Error("invalid Email");
     }
     if(!password||!validate.isStrongPassword(password)){
        throw new Error("weak Password");
     }
}

module.exports=validator;