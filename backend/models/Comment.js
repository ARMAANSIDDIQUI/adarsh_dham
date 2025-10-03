const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Comment content cannot be empty.'],
        trim: true,
        maxlength: [1000, 'Comment cannot be more than 1000 characters.']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);