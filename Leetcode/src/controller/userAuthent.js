const User = require('../model/user');
const Submission = require('../model/submission');
const validate = require('../utils/validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require("../config/redis");

// Environment-aware cookie options
const isProduction = process.env.NODE_ENV === 'production';
const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
};

const register = async (req, res) => {
    try {
        // 1. Validate (Check what's inside this function!)
        await validate(req);

        // 2. Destructure exactly what you want
        const { firstName, emailId, password } = req.body;

        // 3. Simple existence check
        if (!firstName || !emailId || !password) {
            return res.status(400).send("firstName, emailId, and password are required");
        }

        const hashpass = await bcrypt.hash(password, 10);

        // 4. Create the user object explicitly to avoid extra junk keys
        const user = await User.create({
            firstName,
            emailId,
            password: hashpass,
            role: "user"
        });

        const token = jwt.sign(
            { _id: user._id, emailId: user.emailId, role: "user" },
            process.env.Secret_Key,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, cookieOptions);

        res.status(200).json({
            user: {
                firstName: user.firstName,
                emailId: user.emailId,
                userId: user._id,
                role: user.role
            },
            message: "Registered successfully"
        });

    } catch (err) {
        console.error("Register Error:", err.message);
        res.status(400).send(err.message);
    }
}

const adminRegister = async (req, res) => {
    try {
        await validate(req);
        const mandatoryField = ['firstName', 'emailId', 'password'];
        const isAllowed = mandatoryField.every((k) => Object.keys(req.body).includes(k));
        if (!isAllowed) {
            throw new Error("Field missing");
        }
        const hashpass = await bcrypt.hash(req.body.password, 10);
        const { firstName, emailId, password } = req.body;

        const user = await User.create({
            firstName,
            emailId,
            password: hashpass, // the hashed one
            role: "admin"       // explicitly defined
        });
        const token = jwt.sign({ _id: user._id, emailId: user.emailId, role: user.role }, process.env.Secret_Key, { expiresIn: 60 * 60 });
        res.cookie('token', token, cookieOptions);
        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role
        }
        res.status(200).json({
            user: reply,
            message: "Loggin successfully"
        })
    }
    catch (err) {
        res.status(400).send(err.message);
    }
}

const login = async (req, res) => {
    try {
        await validate(req);
        const user = await User.findOne({ emailId: req.body.emailId });
        if (!user) {
            return res.status(404).send("user/admin not found");
        }

        const isAllowed = await bcrypt.compare(req.body.password, user.password);
        if (!isAllowed) {
            throw new Error("invalid credentials");
        }
        const token = jwt.sign({ _id: user._id, emailId: user.emailId, role: user.role }, process.env.Secret_Key, { expiresIn: 60 * 60 });
        res.cookie('token', token, cookieOptions);
        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role
        }
        res.status(200).json({
            user: reply,
            message: "logged in successfully"
        })
    }
    catch (err) {
        res.status(400).send(err.message);
    }
}

const logout = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).send("Not authenticated");
        }
        // const payLoad=jwt.decode(token);
        const payLoad = jwt.verify(token, process.env.Secret_Key);
        await redisClient.set(`token:${token}`, "Blocked");
        await redisClient.expireAt(`token:${token}`, payLoad.exp);
        res.cookie("token", null, { expires: new Date(Date.now()) });
        res.send("logged out");
    }
    catch (err) {
        res.status(503).send(err.message);
    }
}

const getProfile = async (req, res) => {
    try {
        //         const {token}=req.cookies;
        //         if (!token) {
        //   return res.status(401).send("Not authenticated");
        // }
        //             const blocked = await redisClient.get(`token:${token}`);
        //     if (blocked) return res.status(401).send("Session expired");
        //         const payLoad = jwt.verify(token, process.env.Secret_Key);
        //         const user=await User.findOne({emailId:payLoad.emailId});
        //         if(!user){
        //             res.send("no one is logged in");
        //         }

        res.send(req.user);
    }
    catch (err) {
        res.send(err.message);
    }
}

const deleteProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        await User.findByIdAndDelete(userId);
        // await Submission.deleteMany({user_id:userId});
        res.status(200).send("user profile deleted");
    }
    catch (err) {
        res.send(err.message);
    }
}

const searchUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("_id firstName lastName problemSolved");
        if (!user) {
            return res.status(400).send("no such user");
        }
        return res.status(200).send(user);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
}
module.exports = { register, login, logout, getProfile, adminRegister, deleteProfile, searchUser };