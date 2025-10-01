const mongoose = require('mongoose');
const { Schema } = mongoose;

const allocationSchema = new Schema({
    personIndex: Number,
    buildingId: { type: Schema.Types.ObjectId, ref: 'Building' },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
    bedId: { type: Schema.Types.ObjectId, ref: 'Bed' }
});

const bookingSchema = new Schema({
    bookingNumber: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        index: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    eventId: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    formData: {
        stayFrom: Date,
        stayTo: Date,
        ashramName: String,
        baijiMahatmaJi: String,
        baijiContact: String,
        email: String,
        contactNumber: String,
        address: String,
        city: String,
        fillingForOthers: {
            type: Boolean,
            default: false
        },
        people: [{
            name: String,
            age: Number,
            gender: String
        }],
        notes: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'declined'],
        default: 'pending',
        index: true // Index added for faster status filtering
    },
    allocations: [allocationSchema]
}, { timestamps: true });

// Add a compound index for date range queries on the formData subdocument
bookingSchema.index({ 'formData.stayFrom': 1, 'formData.stayTo': 1 });

module.exports = mongoose.model('Booking', bookingSchema);