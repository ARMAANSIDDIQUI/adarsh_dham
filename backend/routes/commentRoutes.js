const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware'); 
const roleMiddleware = require('../middlewares/roleMiddleware');

// === PUBLIC & USER ROUTES ===

// GET /api/comments/ : Public feed route, uses optional auth to personalize the feed
router.get('/', optionalAuthMiddleware, commentController.getPublicCommentsFeed);

// POST /api/comments/ : Create a new comment (requires user to be logged in)
router.post('/', authMiddleware, commentController.createComment);

// GET /api/comments/my-comments : Fetch all comments submitted by a specific user
router.get('/my-comments', authMiddleware, commentController.getUserComments);

// DELETE /api/comments/:id : A user can delete their own comment
router.delete('/:id', authMiddleware, commentController.deleteComment);


// --- ADMIN ROUTES ---

// GET /api/comments/all : Get ALL comments for the admin management page
router.get(
    '/all',
    authMiddleware,
    roleMiddleware(['admin', 'super-admin']),
    commentController.getAllComments
);

// GET /api/comments/pending : Fetch all pending comments for review (admin only)
router.get(
    '/pending', 
    authMiddleware, 
    roleMiddleware(['admin', 'super-admin']), 
    commentController.getPendingComments
);

// PUT /api/comments/approve/:id : Approve a comment (admin only)
router.put(
    '/approve/:id', 
    authMiddleware, 
    roleMiddleware(['admin', 'super-admin']), 
    commentController.approveComment
);

// PUT /api/comments/reject/:id : Reject a comment (admin only)
router.put(
    '/reject/:id', 
    authMiddleware, 
    roleMiddleware(['admin', 'super-admin']), 
    commentController.rejectComment
);

// PUT /api/comments/reconsider/:id : Reconsider a comment, setting it back to pending
router.put(
    '/reconsider/:id',
    authMiddleware,
    roleMiddleware(['admin', 'super-admin']),
    commentController.reconsiderComment
);

module.exports = router;