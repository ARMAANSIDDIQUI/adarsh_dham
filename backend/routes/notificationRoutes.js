// const express = require('express');
// const router = express.Router();
// const authMiddleware = require('../middlewares/authMiddleware');
// const roleMiddleware = require('../middlewares/roleMiddleware');
// const notificationController = require('../controllers/notificationController');

// // POST /api/notifications/ (For admins to send notifications)
// router.post(
//   '/',
//   authMiddleware,
//   roleMiddleware(['admin', 'super-admin']),
//   notificationController.sendNotification
// );

// // GET /api/notifications/ (For a user to get their notifications)
// router.get(
//   '/',
//   authMiddleware,
//   notificationController.getUserNotifications
// );


// // POST /api/notifications/subscribe (Saves a user's subscription object)
// router.post(
//     '/subscribe', 
//     authMiddleware, 
//     notificationController.subscribe
// );

// // DELETE /api/notifications/unsubscribe (Removes a user's subscription object)
// router.delete(
//     '/unsubscribe', 
//     authMiddleware, 
//     notificationController.unsubscribe
// );

// module.exports = router;



const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const notificationController = require('../controllers/notificationController');

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

// GET /api/notifications/unread-count (Get unread notification count)
router.get(
  '/unread-count',
  authMiddleware,
  notificationController.getUnreadCount
);

// POST /api/notifications/mark-as-read (Mark all user notifications as read)
router.post(
  '/mark-as-read',
  authMiddleware,
  notificationController.markAllAsRead
);

// --- NEW ROUTE ---
// POST /api/notifications/:id/mark-as-read (Mark one notification as read)
router.post(
  '/:id/mark-as-read',
  authMiddleware,
  notificationController.markOneAsRead
);
// --- END NEW ROUTE ---


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