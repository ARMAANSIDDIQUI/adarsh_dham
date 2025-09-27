const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const notificationController = require('../controllers/notificationController');

router.post(
  '/',
  authMiddleware,
  roleMiddleware(['admin', 'super-admin']),
  notificationController.sendNotification
);

router.get(
  '/',
  authMiddleware,
  notificationController.getUserNotifications
);

module.exports = router;