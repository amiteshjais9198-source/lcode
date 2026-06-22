const { default: isEmail } = require("validator/lib/isEmail");
const User = require("../model/user");
const Problem = require("../model/problem");
const Submission = require("../model/submission");
const validate = require("../utilis/validator")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");

const isProduction = process.env.NODE_ENV === 'production';
const cookieOptions = {
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction
};


// register
const register = async (req, res) => {
    try {

        // this is validate function which use vaidator lib to validate things  
        validate(req.body);
        const { firstName, emailId, password } = req.body;

        req.body.password = await bcrypt.hash(password, 10);
        req.body.role = "user"; //is walee route se regiter krne wale sare log user honge na ki admin 
        // wo role me admin bhrega then also user hi se register hoga 



        const user = await User.create(req.body);
        const totalProblems = await Problem.countDocuments();
        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id:user._id,
            problemSolved: [],
            totalProblems,
            role: user.role
        }

        // creating jwt token
        const token = jwt.sign({ _id: user._id, emailId: emailId, role: "user" }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        res.cookie('token', token, cookieOptions);
        res.status(201).json({
            success: true,
            reply
        })
    }
    catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        })
    }


}


//login

const login = async (req, res) => {
    try {
        const { password, emailId } = req.body;
        if (!emailId)
            throw new Error("Invalid Credentials");

        if (!password)
            throw new Error("Invalid Credentials");

        const user = await User.findOne({ emailId });
        if (!user) throw new Error("Invalid Credential");
        await user.populate('problemSolved');
        const match = await bcrypt.compare(password, user.password);
        const totalProblems = await Problem.countDocuments();
        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id:user._id,
            problemSolved: user.problemSolved || [],
            totalProblems,
            role: user.role
        }
        if (!match)
            throw new Error("Invalid Credential");

        const token = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        res.cookie('token', token, cookieOptions);
        res.status(200).json({
            success: true,
            reply
        })
    }
    catch (err) {
        res.status(401).json({
            success: false,
            error: err.message
        })
    }

};

// logout

const logout = async (req, res) => {
    try {
        const { token } = req.cookies;

        const payload = jwt.decode(token);   //taking out payload with decode so we have also detail of the expiry time so we can use that at redis db tp expire that thin to free up space 
        await redisClient.set(`token:${token}`, "Blocked");  //this just add teh token present in the redis ddb
        await redisClient.expireAt(`token:${token}`, payload.exp);  //this expires the token from tthe redis db after payload.exp time

        res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true, sameSite: isProduction ? 'none' : 'lax', secure: isProduction });
        res.send("Logged out succesfully")
    }
    catch (err) {
        res.status(503).send("Error occured" + err);
    }
}


//admin registration 
const adminRegister = async (req, res) => {
    try {

        // this is validate function which use vaidator lib to validate things  
        validate(req.body);
        const { firstName, emailId, password } = req.body;

        req.body.password = await bcrypt.hash(password, 10);
        // req.body.role="admin"; //is walee route se regiter krne wale sare log user honge na ki admin 
        // wo role me admin bhrega then also user hi se register hoga 



        const user = await User.create(req.body);

        // creating jwt token
        const token = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        res.cookie('token', token, cookieOptions);
        res.status(201).send("Registration successfull")
    }
    catch (err) {
        res.status(400).send("error occured" + err);
    }
}

//delete profile
const deleteProfile = async (req, res) => {
    try {
        const { _id } = req.result;
        //user schem se delete hogay 
        await User.findByIdAndDelete(_id);
        //submission schema se delete 
        await Submission.deleteMany({ userId: _id });

        res.status(200).send("Profile deleted successfully");
    }
    catch (err) {
        res.status(400).send("error occured" + err);
    }
}


module.exports = { register, login, logout, adminRegister, deleteProfile };
