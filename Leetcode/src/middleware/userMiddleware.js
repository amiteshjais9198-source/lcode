const jwt = require("jsonwebtoken");
const User = require("../model/user");
const redisClient = require("../config/redis");

const userMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    
    if (!token) {
      // Return 401 instead of throwing an error
      return res.status(401).json({ success: false, message: "No token found" });
    }

    const payLoad = jwt.verify(token, process.env.Secret_Key);
    const user = await User.findOne({ emailId: payLoad.emailId });

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const isBlocked = await redisClient.get(`token:${token}`);
    if (isBlocked) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    // Catch JWT expiration or other errors
    return res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

module.exports = userMiddleware;