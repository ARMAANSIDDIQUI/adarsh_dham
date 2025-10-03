const PasswordRequest = require('../models/PasswordRequest');
const User = require('../models/userModel');

// @desc    Create a new password reset request
// @route   POST /api/password-requests
// @access  Public
exports.createRequest = async (req, res) => {
    const { phone, reason } = req.body;

    if (!phone || !reason) {
        return res.status(400).json({ message: 'Phone number and reason are required.' });
    }

    try {
        const user = await User.findOne({ phone });
        if (!user) {
            // We send a generic message for security to not reveal if a phone number is registered.
            return res.status(200).json({ message: 'If a user with this phone number exists, a request has been sent to the administrators.' });
        }

        const newRequest = new PasswordRequest({
            phone,
            reason,
            user: user._id
        });

        await newRequest.save();

        // In a real app, you would also notify admins via email or another channel here.
        console.log(`[ADMIN NOTIFICATION] New password reset request for user: ${user.name} (${phone})`);

        res.status(201).json({ message: 'Your request has been sent to the administrators. They will contact you shortly.' });
    } catch (error) {
        console.error("Error creating password request:", error);
        res.status(500).json({ message: 'Server error while submitting your request.' });
    }
};

// @desc    Get all pending password reset requests
// @route   GET /api/password-requests/pending
// @access  Admin
exports.getPendingRequests = async (req, res) => {
    try {
        const requests = await PasswordRequest.find({ status: 'pending' })
            .populate('user', 'name phone')
            .sort({ createdAt: 'desc' });
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching requests.' });
    }
};

// @desc    Mark a password reset request as resolved
// @route   PUT /api/password-requests/:id/resolve
// @access  Admin
exports.resolveRequest = async (req, res) => {
    try {
        const request = await PasswordRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found.' });
        }

        request.status = 'resolved';
        await request.save();

        res.status(200).json({ message: 'Request marked as resolved.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error resolving request.' });
    }
};