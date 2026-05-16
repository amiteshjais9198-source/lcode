const express=require("express");
const adminMiddleware=require("../middleware/adminMiddleware");
const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedProblem,submissionsForProblemByUser,getProblemByIdAdmin}=require("../controller/userProblem");
const problemRouter=express.Router();
const userMiddleware=require('../middleware/userMiddleware');


problemRouter.post('/problem',adminMiddleware,createProblem);
problemRouter.put('/update/:id',adminMiddleware,updateProblem);
problemRouter.delete('/delete/:id',adminMiddleware,deleteProblem);
problemRouter.get('/fetch/:id',userMiddleware,getProblemById);
problemRouter.get('/problem/:id',adminMiddleware,getProblemByIdAdmin);
problemRouter.get('/fetchAll/:page/:limit',userMiddleware,getAllProblem);
problemRouter.get('/solvedByUser',userMiddleware,solvedProblem);
problemRouter.get('/submissionsforproblem/:id',userMiddleware,submissionsForProblemByUser);
module.exports=problemRouter;




