const Problem=require("../model/problem");
const User=require("../model/user");
const Submissions=require("../model/submission");
const {getLanguageId,submitBatch,submitoken,statusresult}=require("../utils/problemUtility");
const SolutionVideo=require("../model/videoSolution");

const createProblem=async (req,res)=>{
    const {title,description,difficulty,tags,role,visibleTestCases,invisibleTestCases,startcode,refrencesolution,problemCreator}=req.body;
    try{
        // Validate required fields
        if (!refrencesolution || !Array.isArray(refrencesolution) || refrencesolution.length === 0) {
            return res.status(400).json({ success: false, message: "refrencesolution is required" });
        }
        if (!visibleTestCases || !Array.isArray(visibleTestCases) || visibleTestCases.length === 0) {
            return res.status(400).json({ success: false, message: "visibleTestCases is required" });
        }

        for(const {language,solution} of refrencesolution){
            const workerLanguage=getLanguageId(language);
            
            if (!workerLanguage) {
                return res.status(400).json({
                    success: false,
                    message: `Unsupported language: ${language}`
                });
            }

            const submission=visibleTestCases.map((testcases)=>({
                source_code:solution,
                language: workerLanguage,
                stdin:testcases.input,
                expected_output:testcases.output,
            }));
        
            const submitResult = await submitBatch(submission);

            if (!submitResult || submitResult.length === 0) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to submit code for validation"
                });
            }

            const resultoken = submitResult.map(value => value.token);
         
            const testResult = await submitoken(resultoken);
            
            if (!testResult || testResult.length === 0) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to retrieve validation results"
                });
            }

            console.log(`[createProblem] JDoodle results for language=${language}:`, JSON.stringify(testResult));

            for (const test of testResult) {
                // status_id 13 = Internal Error from JDoodle service itself (not a code error)
                if (test.status_id === 13) {
                    return res.status(503).json({
                        success: false,
                        message: "Code validation service is temporarily unavailable. Please try again in a moment.",
                        status_id: test.status_id,
                    });
                }
                if (test.status_id !== 3) {
                    return res.status(400).json({
                        success: false,
                        message: `Reference solution (${language}) failed: ${statusresult(test.status_id)}`,
                        status_id: test.status_id,
                        stdout: test.stdout || '',
                        stderr: test.stderr || ''
                    });
                }
            }
        }

        const userProblem=await Problem.create({
            ...req.body,
            problemCreator:req.user._id
        });
        return res.status(201).json({ success: true, message: "Problem created successfully", id: userProblem._id });
    }
    catch(err){
        console.error("Error in createProblem:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Internal server error"
        });
    }
}
const updateProblem=async (req,res)=>{
    const {id}=req.params;
    const {title,description,difficulty,tags,role,visibleTestCases,invisibleTestCases,startcode,refrencesolution,problemCreator}=req.body;
    try{
        if(!id){
            return res.status(400).send("invalid id");
        }
        const oldversionprob=await Problem.findById(id);
        if(!oldversionprob){
            return res.status(404).send("no such problem exists");
        } 
       
           for(const {language,solution} of refrencesolution){
        const workerLanguage=getLanguageId(language);
        
        if (!workerLanguage) {
            return res.status(400).json({
                success: false,
                message: `Unsupported language: ${language}`
            });
        }

        console.log("1start");
        const submission=visibleTestCases.map((testcases)=>({
            source_code:solution,
            language: workerLanguage, // Use language string instead of language_id
            stdin:testcases.input,
            expected_output:testcases.output,
        }))
        console.log("1 end");
        
        const submitResult = await submitBatch(submission);

        if (!submitResult || submitResult.length === 0) {
            return res.status(500).json({
                success: false,
                message: "Failed to submit code for validation"
            });
        }

        const resultoken = submitResult.map(value => value.token);
        console.log("2 end")
        
        const testResult = await submitoken(resultoken);
        
        if (!testResult || testResult.length === 0) {
            return res.status(500).json({
                success: false,
                message: "Failed to retrieve validation results"
            });
        }

        for (const test of testResult) {
            if (test.status_id !== 3) {
                return res.status(400).json({
                    success: false,
                    message: statusresult(test.status_id),
                    status_id: test.status_id,
                    stdout: test.stdout || '',
                    stderr: test.stderr || ''
                });
            }
        }
    }
        

        const newprob=await Problem.findByIdAndUpdate(id,{...req.body},{runValidators:true,new:true});
       return res.status(200).send("succcesfully updated");
    }
    catch(err){
        return res.status(400).json({ success: false, message: err.message });
    }
}
const deleteProblem=async (req,res)=>{
    const {id}=req.params;
    try{
         if(!id){
            return res.send("invalid id");
        }
        const deletedprob=await Problem.findByIdAndDelete(id);
        if(!deletedprob){
            return res.status(404).send("no such problem exists");
        } 
        res.status(200).send(deletedprob);
    }
   catch(err){
    res.status(400).send(err.message);
   }
}
const getProblemById=async (req,res)=>{
    const {id}=req.params;
    try{
        if(!id){
            return res.send("empty id");
        }
        // console.log(id);
        const problem=await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startcode refrencesolution').lean();
        // console.log(problem);
        if(!problem){
            return res.status(400).send("bad request");
        }
        const video= await SolutionVideo.findOne({problemId:id});
        // console.log(video);
        if(video){
            problem.cloudinaryPublicId=video.cloudinaryPublicId;
            problem.secureUrl=video.secureUrl;
            problem.thumbnailUrl=video.thumbnailUrl;
            problem.duration=video.duration;
        }
        return res.status(201).send(problem);
    }
    catch(err){
        return res.status(404).send(err.message);
    }
}

const getProblemByIdAdmin=async (req,res)=>{
    const {id}=req.params;
    try{
        if(!id){
            return res.status(400).send("empty id");
        }
        const problem=await Problem.findById(id).select('_id title description difficulty tags visibleTestCases invisibleTestCases startcode refrencesolution').lean();
        console.log("Admin fetched problem:", problem ? problem._id : "null");
        if(!problem){
            return res.status(404).send("bad request");
        }
        const video= await SolutionVideo.findOne({problemId:id});
        console.log(video);
        if(video){
            problem.cloudinaryPublicId=video.cloudinaryPublicId;
            problem.secureUrl=video.secureUrl;
            problem.thumbnailUrl=video.thumbnailUrl;
            problem.duration=video.duration;
        }
        return res.status(201).send(problem);
    }
    catch(err){
        return res.status(404).send(err.message);
    }
}

const getAllProblem=async (req,res)=>{
    const {page,limit}=req.params;
   try{
    if(!page&&!limit){
      // Fixed: .select() must be called on the query, not on the response
      const store=await Problem.find({}).select('_id title difficulty tags');
      return res.status(200).send(store);
    }
    const skip=(page-1)*limit; 
    const store=await Problem.find().skip(skip).limit(limit).select('_id title difficulty tags');
      return res.status(200).send(store);
   }
   catch(err){
    return res.send(err.message);
   }
}
const solvedProblem=async (req,res)=>{
    
    try{
       const userid=req.user._id;
       const coder=await User.findById(userid).populate({
        path:"problemSolved",
        select:"_id title difficulty tags"
       });
        res.status(200).send(coder.problemSolved);
    }
    catch(err){
        res.send(err.message);
    }
}

const submissionsForProblemByUser=async (req,res)=>{
     try{
        const userId=req.user._id;
        const probId=req.params.id;
        const ans=await Submissions.find({
            user_id: userId, 
            problem_id: probId
        });
        if(ans.length==0){
            return res.status(200).send("No submissions");
        }
        return res.status(200).send(ans);
     }
     catch(err){
        return res.status(400).send(err.message);
     }
}

module.exports={createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedProblem,getProblemByIdAdmin,submissionsForProblemByUser};

