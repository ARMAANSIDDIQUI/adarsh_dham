const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.login);
router.post('/check-recovery-method', authController.checkRecoveryMethod);
router.post('/reset-password-otp', authController.resetPasswordWithOtp);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;