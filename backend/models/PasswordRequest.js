const mongoose = require('mongoose');
const { Schema } = mongoose;

const passwordRequestSchema = new Schema({
    phone: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true,
        trim: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'resolved'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('PasswordRequest', passwordRequestSchema);