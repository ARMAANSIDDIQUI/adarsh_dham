const mongoose = require('mongoose');
const { Schema } = mongoose;

const personSchema = new Schema({
    // Link to the booking this person is part of
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        index: true
    },
    // NEW: The human-readable booking number for easier reference
    bookingNumber: {
        type: String,
        required: true
    },
    // Link to the user who made the original booking
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Link to the event for which the stay is
    eventId: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
        index: true
    },
    // The specific bed this person is assigned to
    bedId: {
        type: Schema.Types.ObjectId,
        ref: 'Bed',
        required: true,
        index: true
    },
    // Personal details copied from the booking form
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number
    },
    gender: {
        type: String
    },
    // The duration of this person's stay
    stayFrom: {
        type: Date,
        required: true
    },
    stayTo: {
        type: Date,
        required: true
    },
    // NEW FIELDS COPIED FROM BOOKING FOR EASIER REPORTING
    ashramName: {
        type: String
    },
    contactNumber: {
        type: String
    },
    city: {
        type: String
    },
    baijiMahatmaJi: {
        type: String
    },
}, { timestamps: true });

module.exports = mongoose.model('Person', personSchema);