const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
  message: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  role: {
    type: String
  },
  read: {
    type: Boolean,
    default: false
  },
  target: {
    type: String,
    enum: ['user', 'admin'],
    required: true
  },
  ttl: {
    type: Date,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);