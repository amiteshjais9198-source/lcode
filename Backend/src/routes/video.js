const express = require('express');
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
    getVideosByProblem,
    generateUploadSignature,
    saveVideoMetadata,
    deleteVideo,
} = require('../controllers/solutionVideo');

const videoRouter = express.Router();

// GET all videos for a problem — public, any logged-in user can view
videoRouter.get('/:problemId', userMiddleware, getVideosByProblem);

// POST generate Cloudinary upload signature — ADMIN ONLY
videoRouter.post('/generate-signature', adminMiddleware, generateUploadSignature);

// POST save video metadata after Cloudinary upload — ADMIN ONLY
videoRouter.post('/save', adminMiddleware, saveVideoMetadata);

// DELETE a video by its ID — ADMIN ONLY
videoRouter.delete('/:videoId', adminMiddleware, deleteVideo);

module.exports = videoRouter;
