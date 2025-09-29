// backend/models/roomModel.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const roomSchema = new Schema({
    buildingId: {
        type: Schema.Types.ObjectId,
        ref: 'Building',
        required: true
    },
    roomNumber: {
        type: String,
        required: true
    },
    beds: [{
        type: Schema.Types.ObjectId,
        ref: 'Bed'
    }]
}, { 
    timestamps: true,
    // REMOVED: toJSON and toObject with virtuals, as they are no longer accurate.
});

// The old virtuals are removed. Capacity and Occupancy will be calculated
// in the controller based on the beds and the people in them for a given date.

module.exports = mongoose.model('Room', roomSchema);