const mongoose = require('mongoose');
const { Schema } = mongoose;

const submissionSchema = new Schema({
    problem_id: {
        type: Schema.Types.ObjectId,
        ref: 'problems',
        required: true,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },    
    runtime: {
        type: Number,
        default: 0,
    },
    memory: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'wrong', 'error'],
        default: 'pending'
    },
    testcasespassed: {
        type: Number,
        default: 0,
    },
    totaltestcases: {
        type: Number,
        default: 0,
    },
    errormessage: {
        type: String,
        default: '',
    }    
},
{ timestamps: true });

/** * COMPOUND INDEX
 * This optimizes queries that filter by user_id and then sort by problem_id.
 * 1 = Ascending order.
 */
submissionSchema.index({ user_id: 1, problem_id: 1 });

const Submission = mongoose.model("submissions", submissionSchema);
module.exports = Submission;