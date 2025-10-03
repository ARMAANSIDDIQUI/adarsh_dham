const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware'); // NEW
const roleMiddleware = require('../middlewares/roleMiddleware');

// ✨ NEW: Public feed route, uses optional auth to personalize the feed
router.get('/', optionalAuthMiddleware, commentController.getPublicCommentsFeed);

// POST: Create a new comment (requires user to be logged in)
router.post('/', authMiddleware, commentController.createComment);

// GET: Fetch all comments submitted by a specific user (can be kept for other features)
router.get('/my-comments', authMiddleware, commentController.getUserComments);

// --- Admin Routes ---

// GET: Fetch all pending comments for review (admin only)
router.get(
    '/pending', 
    authMiddleware, 
    roleMiddleware(['admin', 'super-admin']), 
    commentController.getPendingComments
);

// PUT: Approve a comment (admin only)
router.put(
    '/approve/:id', 
    authMiddleware, 
    roleMiddleware(['admin', 'super-admin']), 
    commentController.approveComment
);

// PUT: Reject a comment (admin only)
router.put(
    '/reject/:id', 
    authMiddleware, 
    roleMiddleware(['admin', 'super-admin']), 
    commentController.rejectComment
);

module.exports = router;