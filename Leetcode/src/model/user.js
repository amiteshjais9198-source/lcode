const mongoose=require('mongoose');
const {Schema}=mongoose;

const userSchema=new Schema({
    firstName:{
        type:String,
        required:true,
        minLength:3,
        maxLength:18,
    },
    lastName:{
      type:String,
      minLength:3,
      maxLength:18,
    },
    emailId:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        unique:true,
        immutable:true,
    },
    age:{
        type:Number,
        min:6,
        max:80,
    },
    role:{
        type:String,
        enum:['admin','user'],
        default:'user',
    },
   problemSolved:{
       type:[{
           type:Schema.Types.ObjectId,
           ref:'problems',
       }],
    },
    password:{
        type:String,
        required:true,
    }
},
{timestamps:true})

userSchema.post('findOneAndDelete',async function(userInfo){
    if(userInfo){
        await mongoose.model('submissions').deleteMany({user_id:userInfo._id});
    }
});

const User=mongoose.model("user",userSchema);
module.exports=User;