const mongoose = require('mongoose');
const { Schema } = mongoose;

const buildingSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    rooms: [{
        type: Schema.Types.ObjectId,
        ref: 'Room'
    }],
    gender: {
        type: String,
        enum: ['male', 'female', 'unisex'],
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Building', buildingSchema);