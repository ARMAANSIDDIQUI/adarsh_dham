const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  roles: [{
    type: String,
    enum: ['user', 'admin', 'super-admin', 'super-operator', 'operator', 'satsang-operator'],
    default: 'user'
  }],
  bookings: [{
    type: Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  // Add this field to store FCM tokens
  fcmTokens: [{
    type: String,
    unique: true
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);