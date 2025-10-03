const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const notificationController = require('../controllers/notificationController');

// --- Routes for In-Website Notifications ---

// POST /api/notifications/ (For admins to send notifications)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['admin', 'super-admin']),
  notificationController.sendNotification
);

// GET /api/notifications/ (For a user to get their notifications)
router.get(
  '/',
  authMiddleware,
  notificationController.getUserNotifications
);


// --- Routes for OS-Level (Web Push) Subscription Management ---

// POST /api/notifications/subscribe (Saves a user's subscription object)
router.post(
    '/subscribe', 
    authMiddleware, 
    notificationController.subscribe
);

// DELETE /api/notifications/unsubscribe (Removes a user's subscription object)
router.delete(
    '/unsubscribe', 
    authMiddleware, 
    notificationController.unsubscribe
);

module.exports = router;