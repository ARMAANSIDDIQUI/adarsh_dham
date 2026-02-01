const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
// const { protect, authorize } = require('../middleware/authMiddleware'); // Uncomment if protection is needed

// Route to send email
// router.post('/send', protect, authorize('admin', 'super-admin'), emailController.sendEmail); // Secure by default
router.post('/send', emailController.sendEmail); // Public for now, user can secure it

module.exports = router;
