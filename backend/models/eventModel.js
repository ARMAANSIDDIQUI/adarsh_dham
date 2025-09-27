const mongoose = require('mongoose');
const { Schema } = mongoose;

const eventSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: String,
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  bookingStartDate: {
    type: Date,
    required: true
  },
  bookingEndDate: {
    type: Date,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);