const mongoose = require('mongoose');
const { Schema } = mongoose;

const roomSchema = new Schema({
    buildingId: {
        type: Schema.Types.ObjectId,
        ref: 'Building',
        required: true
    },
    eventId: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    roomNumber: {
        type: String,
        required: true
    },
    // The 'capacity' field is no longer needed here, as it will be calculated.
    // capacity: {
    //     type: Number,
    //     required: true
    // },
    beds: [{
        type: Schema.Types.ObjectId,
        ref: 'Bed'
    }]
}, { 
    timestamps: true,
    // Important: enable virtuals for JSON output
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// VIRTUAL: Automatically calculates total capacity from its beds
roomSchema.virtual('capacity').get(function() {
    if (!this.beds || this.beds.length === 0) {
        return 0;
    }
    // Assumes beds are populated. Sums up the capacity of each bed.
    return this.beds.reduce((total, bed) => total + (bed.type === 'double' ? 2 : 1), 0);
});

// VIRTUAL: Automatically calculates current occupancy from its beds
roomSchema.virtual('occupancy').get(function() {
    if (!this.beds || this.beds.length === 0) {
        return 0;
    }
    // Assumes beds are populated. Sums up the occupancy of each bed.
    return this.beds.reduce((total, bed) => total + bed.occupancy, 0);
});

module.exports = mongoose.model('Room', roomSchema);