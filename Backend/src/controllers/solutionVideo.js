const cloudinary = require('cloudinary').v2;
const SolutionVideo = require('../model/solutionVideo');

// Make sure these are added to your .env file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.getVideosByProblem = async (req, res) => {
    try {
        const { problemId } = req.params;
        const videos = await SolutionVideo.find({ problemId })
            .populate('userId', 'firstName')   // fetch uploader's name from User collection
            .sort({ createdAt: -1 });     // newest first

        res.status(200).json({ success: true, videos });
    } catch (error) {
        console.error("Error fetching videos:", error);
        res.status(500).json({ success: false, message: "Failed to fetch videos" });
    }
};

exports.generateUploadSignature = async (req, res) => {
    try {
        const timestamp = Math.round((new Date).getTime() / 1000);
        
        // We set the upload folder to 'solution_videos' in Cloudinary
        const paramsToSign = {
            timestamp: timestamp,
            folder: 'solution_videos',
        };

        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET
        );

        res.status(200).json({
            success: true,
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            folder: 'solution_videos'
        });
    } catch (error) {
        console.error("Error generating Cloudinary signature:", error);
        res.status(500).json({ success: false, message: "Failed to generate upload signature" });
    }
};

exports.saveVideoMetadata = async (req, res) => {
    try {
        const { problemId, cloudinaryPublicId, secureUrl, thumbnailUrl, duration } = req.body;
        // userMiddleware sets req.result (the User document)
        const userId = req.result._id;

        if (!problemId || !cloudinaryPublicId || !secureUrl) {
            return res.status(400).json({ success: false, message: "Missing required video fields" });
        }

        const newVideo = new SolutionVideo({
            problemId,
            userId,
            cloudinaryPublicId,
            secureUrl,
            thumbnailUrl,
            duration
        });

        await newVideo.save();

        res.status(201).json({
            success: true,
            message: "Video uploaded and metadata saved successfully",
            video: newVideo
        });
    } catch (error) {
        console.error("Error saving video metadata:", error);
        res.status(500).json({ success: false, message: "Failed to save video metadata" });
    }
};

exports.deleteVideo = async (req, res) => {
    try {
        const { videoId } = req.params;
        const userId = req.result._id;

        // Find the video record in the database
        const video = await SolutionVideo.findById(videoId);

        if (!video) {
            return res.status(404).json({ success: false, message: "Video not found" });
        }

        // Check if the user trying to delete is the original uploader
        if (video.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "You are not authorized to delete this video" });
        }

        // 1. Delete the video file from Cloudinary 
        // (Must specify resource_type: 'video' otherwise it assumes it's an image)
        await cloudinary.uploader.destroy(video.cloudinaryPublicId, { resource_type: 'video' });

        // 2. Delete the record from MongoDB
        await SolutionVideo.findByIdAndDelete(videoId);

        res.status(200).json({ success: true, message: "Video deleted successfully" });
    } catch (error) {
        console.error("Error deleting video:", error);
        res.status(500).json({ success: false, message: "Failed to delete video" });
    }
};
