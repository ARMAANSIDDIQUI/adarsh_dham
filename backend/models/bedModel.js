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
        enum: ['single', 'floor bed'],
        default: 'single'
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

bedSchema.virtual('capacity').get(function() {
    return 1;
});

module.exports = mongoose.model('Bed', bedSchema);