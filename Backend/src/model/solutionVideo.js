const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const solutionVideoSchema = new Schema({
  problemId: {
    type: Schema.Types.ObjectId,
    ref: 'problem',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  cloudinaryPublicId: {
    type: String,
    required: true,
  },
  secureUrl: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
    required: false,
  },
  duration: {
    type: Number,
    required: false,
  }
}, {
  timestamps: true
});

const SolutionVideo = mongoose.model('SolutionVideo', solutionVideoSchema);

module.exports = SolutionVideo;
