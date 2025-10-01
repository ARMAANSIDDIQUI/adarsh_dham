const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const notificationController = require('../controllers/notificationController');
const User = require('../models/userModel'); // Required for the subscribe route

// --- Routes for In-Website Notifications ---

// POST /api/notifications/ (For admins to send an in-site notification)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['admin', 'super-admin']),
  notificationController.sendNotification
);

// GET /api/notifications/ (For a user to get their list of in-site notifications)
router.get(
  '/',
  authMiddleware,
  notificationController.getUserNotifications
);


// --- Route for OS-Level (Web Push) Notifications ---

// POST /api/notifications/subscribe
// This receives the subscription object from the browser for OS-level push notifications.
router.post('/subscribe', authMiddleware, async (req, res) => {
    const subscription = req.body;
    const userId = req.user.id;

    try {
        // Find the logged-in user and save their Web Push subscription object
        await User.findByIdAndUpdate(userId, { $set: { pushSubscription: subscription } });
        
        res.status(200).json({ message: 'Web Push subscription saved successfully.' });
    } catch (error) {
        console.error("Error saving Web Push subscription:", error);
        res.status(500).json({ message: 'Could not save Web Push subscription.' });
    }
});


module.exports = router;