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
});

module.exports = mongoose.model('Room', roomSchema);