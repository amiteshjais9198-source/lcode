const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require("express");
const app = express();
app.set('trust proxy', 1);
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const main = require("./config/db")
const cookieparser = require("cookie-parser");
const authRouter = require("./routes/userAuth");
const redisClient = require('./config/redis');
const problemRouter = require("./routes/problemCreator");
const submitRouter=require("./routes/submit");
const airouter=require("./routes/aiChatting")
const videoRouter = require("./routes/video");
const { generalLimiter } = require("./middleware/rateLimiter");
const cors = require('cors');
app.use(cors({
    origin: function (origin, callback) {
        // Allow any localhost origin (any port) — works whether Vite runs on 5173, 5174, etc.
        if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(cookieparser());

app.use(generalLimiter); // Applied to all incoming requests
app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/",submitRouter);
app.use("/ai",airouter);
app.use("/video", videoRouter);

const InitalizeConnection = async () => {
    try {
        await Promise.all([main(), redisClient.connect()]);
        console.log("The db is connected");

        app.listen(process.env.PORT, () => {
            console.log("SERVER LISTENING AT " + process.env.PORT);
        })

    }
    catch (err) {
        console.error("Error connecting to services:", err);
        if (err.errors) {
            console.error("Individual errors:", err.errors);
        }
    }
}

InitalizeConnection();

