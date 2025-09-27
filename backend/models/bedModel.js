const mongoose = require('mongoose');
const { Schema } = mongoose;

const bedSchema = new Schema({
    roomId: {
        type: Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['single', 'double'],
        default: 'single'
    },
    occupancy: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['available', 'booked', 'partially-booked'],
        default: 'available'
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

bedSchema.virtual('capacity').get(function() {
    return this.type === 'double' ? 2 : 1;
});

module.exports = mongoose.model('Bed', bedSchema);