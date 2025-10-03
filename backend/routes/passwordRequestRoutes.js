const express = require('express');
const router = express.Router();
const requestController = require('../controllers/passwordRequestController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Public route for any user to create a request
router.post('/', requestController.createRequest);

// Admin-only route to get all pending requests
router.get(
    '/pending',
    authMiddleware,
    roleMiddleware(['admin', 'super-admin']),
    requestController.getPendingRequests
);

// Admin-only route to mark a request as resolved
router.put(
    '/:id/resolve',
    authMiddleware,
    roleMiddleware(['admin', 'super-admin']),
    requestController.resolveRequest
);

module.exports = router;