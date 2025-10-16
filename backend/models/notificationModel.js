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
  sendAt: {
    type: Date 
  },
  status: {
    type: String,
    enum: ['scheduled', 'sent', 'failed'],
    default: 'sent'
  },
  ttl: {
    type: Date,
    required: true
  }
}, { timestamps: true });

notificationSchema.index({ "ttl": 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);