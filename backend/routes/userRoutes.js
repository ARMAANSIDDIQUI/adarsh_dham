const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// This middleware ensures all routes in this file are protected and require a valid token.
router.use(authMiddleware);

// Defines the route PUT /api/users/profile
router.route('/profile').put(userController.updateMyProfile);

// Defines the route PUT /api/users/change-password
router.route('/change-password').put(userController.changeMyPassword);

module.exports = router;