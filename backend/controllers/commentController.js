const Comment = require('../models/Comment');

// Create a new comment. The user ID is retrieved from the authenticated request.
exports.createComment = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ message: 'Comment content is required.' });
        }
        const user = req.user.id; 
        
        const newComment = new Comment({ user, content });
        await newComment.save();
        
        res.status(201).json({ message: 'Your comment has been submitted and is awaiting review.' });
    } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({ message: 'Server error. Could not submit comment.' });
    }
};

// ✨ NEW/UPDATED FUNCTION
// Get all comments for public display, including user-specific ones
exports.getPublicCommentsFeed = async (req, res) => {
    try {
        // 1. Get all approved comments and populate the user's name
        const approvedCommentsQuery = Comment.find({ status: 'approved' })
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        let userCommentsQuery = Promise.resolve([]);
        // 2. If a user is logged in, also get their pending/rejected comments
        if (req.user) {
            userCommentsQuery = Comment.find({
                user: req.user.id,
                status: { $in: ['pending', 'rejected'] }
            }).populate('user', 'name').sort({ createdAt: -1 });
        }

        // 3. Run both queries in parallel
        const [approved, personal] = await Promise.all([approvedCommentsQuery, userCommentsQuery]);

        // 4. Combine the lists
        const allComments = [...personal, ...approved];
        
        // 5. Remove duplicates (in case a user's own approved comment is fetched twice)
        const uniqueComments = allComments.filter((v, i, a) => a.findIndex(t => (t._id.equals(v._id))) === i);

        res.status(200).json(uniqueComments);
    } catch (error) {
        console.error("Error fetching public comment feed:", error);
        res.status(500).json({ message: 'Server error. Could not retrieve comments.' });
    }
};


// Get all comments for the currently logged-in user.
exports.getUserComments = async (req, res) => {
    try {
        const userId = req.user.id; 
        const comments = await Comment.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json(comments);
    } catch (error) {
        console.error("Error fetching user comments:", error);
        res.status(500).json({ message: 'Server error. Could not retrieve your comments.' });
    }
};

// (Admin) Get all comments pending review.
exports.getPendingComments = async (req, res) => {
    try {
        const comments = await Comment.find({ status: 'pending' }).populate('user', 'name phone').sort({ createdAt: 1 });
        res.status(200).json(comments);
    } catch (error) {
        console.error("Error fetching pending comments:", error);
        res.status(500).json({ message: 'Server error. Could not retrieve comments.' });
    }
};

// (Admin) Approve a comment.
exports.approveComment = async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await Comment.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }
        res.status(200).json({ message: 'Comment approved successfully.', comment });
    } catch (error) {
        console.error("Error approving comment:", error);
        res.status(500).json({ message: 'Server error. Could not approve comment.' });
    }
};

// (Admin) Reject a comment.
exports.rejectComment = async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await Comment.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }
        res.status(200).json({ message: 'Comment rejected successfully.', comment });
    } catch (error) {
        console.error("Error rejecting comment:", error);
        res.status(500).json({ message: 'Server error. Could not reject comment.' });
    }
};

// (Public) Get all approved comments to display on the website.
exports.getApprovedComments = async (req, res) => {
    try {
        const comments = await Comment.find({ status: 'approved' }).populate('user', 'name').sort({ createdAt: -1 });
        res.status(200).json(comments);
    } catch (error)
        {
        console.error("Error fetching approved comments:", error);
        res.status(500).json({ message: 'Server error. Could not retrieve comments.' });
    }
};