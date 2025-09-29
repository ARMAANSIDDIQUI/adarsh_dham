// models/liveLinkModel.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const liveLinkSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    // ADDED: Optional field for YouTube embed URL
    youtubeEmbedUrl: {
        type: String,
        required: false 
    },
    liveFrom: {
        type: Date,
        required: true
    },
    liveTo: {
        type: Date,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('LiveLink', liveLinkSchema);