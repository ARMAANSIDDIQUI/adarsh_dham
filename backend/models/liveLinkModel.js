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
    // eventId: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Event',
    //     required: true
    // },
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