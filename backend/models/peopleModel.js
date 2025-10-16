const mongoose = require('mongoose');
const { Schema } = mongoose;

const personSchema = new Schema({
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        index: true
    },
    bookingNumber: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    eventId: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
        index: true
    },
    bedId: {
        type: Schema.Types.ObjectId,
        ref: 'Bed',
        required: true,
        index: true
    },
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
    stayFrom: {
        type: Date,
        required: true
    },
    stayTo: {
        type: Date,
        required: true
    },
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