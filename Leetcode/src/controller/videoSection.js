const cloudinary = require('cloudinary').v2;
const Problem = require("../model/problem");
const User = require("../model/user");
const SolutionVideo = require("../model/videoSolution");
const { sanitizeFilter } = require('mongoose');


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const generateUploadSignature = async (req, res) => {
  try {
    const { problemId } = req.params;
    
    const userId = req.user._id;
    // Verify problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Generate unique public_id for the video
    const timestamp = Math.round(new Date().getTime() / 1000);
    const publicId = `leetcode-solutions/${problemId}/${userId}_${timestamp}`;
    
    // Upload parameters
    const uploadParams = {
      timestamp: timestamp,
      public_id: publicId,
    };

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      public_id: publicId,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
    });

  } catch (error) {
    console.error('Error generating upload signature:', error);
    res.status(500).json({ error: 'Failed to generate upload credentials' });
  }
};


const saveVideoMetadata = async (req, res) => {
  try {
    const { problemId, cloudinaryPublicId, secureUrl, duration } = req.body;
    const userId = req.user._id;

    const cloudinaryResource = await cloudinary.api.resource(
      cloudinaryPublicId,
      { resource_type: 'video' }
    );

    if (!cloudinaryResource) {
      return res.status(400).json({ error: 'Video not found on Cloudinary' });
    }
    
   const thumbnailUrl = cloudinary.image(cloudinaryResource.public_id,{resource_type: "video"})

    // Instance creation
    const videoSolution = new SolutionVideo({
      problemId,
      userId,
      cloudinaryPublicId,
      secureUrl,
      duration: cloudinaryResource.duration || duration,
      thumbnailUrl
    });

    // FIX: Save the INSTANCE, not the Model
    const savedVideo = await videoSolution.save(); 

    res.status(201).json({
      message: 'Video solution saved successfully',
      videoSolution: {
        id: savedVideo._id,
        thumbnailUrl: savedVideo.thumbnailUrl,
        duration: savedVideo.duration,
        uploadedAt: savedVideo.createdAt
      }
    });
  } catch (error) {
    console.error('Error saving video metadata:', error);
    res.status(500).json({ error: 'Failed to save video metadata' });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user._id; // Use consistent req.user

    // Authorization Check: Find video first to ensure ownership
    const video = await SolutionVideo.findOneAndDelete({problemId:problemId});
    // console.log(video);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Only allow the owner to delete
    if (video.userId.toString() !== userId.toString()) {
        return res.status(403).json({ error: 'Unauthorized to delete this video' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(video.cloudinaryPublicId, { 
        resource_type: 'video', 
        invalidate: true 
    });

    // Delete from MongoDB
    await SolutionVideo.findByIdAndDelete(videoId);

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
};

module.exports = {generateUploadSignature,saveVideoMetadata,deleteVideo};