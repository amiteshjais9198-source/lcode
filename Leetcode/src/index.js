const express =require('express');
require('dotenv').config();
const cors = require('cors'); // 1. Import CORS
const app=express();
const main=require('./config/db');
const cookieParser=require('cookie-parser');
const authRouter=require('./routes/userAuth');
const problemRouter=require("./routes/problemStore");
const submitRouter=require("./routes/submit");
const redisClient=require("./config/redis");
const aiRouter=require("./routes/aichat");
const videoRouter=require("./routes/videoCreator");
// app.use(rateLimiter)

const allowedOrigins = [
  'http://localhost:5173',
  'https://coding-platform-git-main-mpriyanshu22s-projects.vercel.app',
  'https://coding-platform-9dffqd3mm-mpriyanshu22s-projects.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // 1. Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    // 2. Check if the origin is in our allowed list OR is a vercel subdomain
    const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin); // This will show in your Render logs
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth',authRouter);
app.use('/api/admin',problemRouter);
app.use('/api/user',submitRouter);
app.use('/api/ai',aiRouter);
app.use('/api/video',videoRouter);
const redisconnection=async ()=>{
  // await redisClient.connect();
  // console.log("redis is connected");

  // await main();
  // console.log("connected to db");
   await Promise.all([redisClient.connect(),main()])
   console.log("connected to redis and db");
  app.listen(process.env.PORT,()=>{
      console.log("server has been started at port 5000");
    })
}

redisconnection();
// service_01u3vos
// template_0e05lgf
// 7Q7_MHYMCvpscDH6e
//cloudname=dxdycaizk
//apisecret-kwkl896Eou0PXFS-FpW_a1dZmrI
//apikey-933973817177293