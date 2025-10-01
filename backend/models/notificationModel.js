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
    enum: ['user', 'admin', 'all'],
    required: true
  },
  // NEW: The scheduled time for the notification to be sent. Null for immediate.
  sendAt: {
    type: Date 
  },
  // NEW: The status to track scheduled notifications.
  status: {
    type: String,
    enum: ['scheduled', 'sent', 'failed'],
    default: 'sent'
  },
  // Time-To-Live: When the notification should expire and be hidden.
  ttl: {
    type: Date,
    required: true
  }
}, { timestamps: true });

// This index will automatically remove notification documents from the database once their 'ttl' time is reached.
notificationSchema.index({ "ttl": 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);