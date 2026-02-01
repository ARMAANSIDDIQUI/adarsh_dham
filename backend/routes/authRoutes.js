const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/send-otp', authController.sendOtp);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;