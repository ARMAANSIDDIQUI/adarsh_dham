const mongoose = require('mongoose');

const passwordResetRequestSchema = new mongoose.Schema({
    // Store the user who made the request
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Optional field for the user to explain why they need a reset
    requestText: {
        type: String,
        trim: true,
        default: 'User has forgotten their password.',
    },
    // Status to track the request lifecycle
    status: {
        type: String,
        enum: ['pending', 'completed', 'rejected'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('PasswordResetRequest', passwordResetRequestSchema);