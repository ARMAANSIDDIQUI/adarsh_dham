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
        // Check for user with or without country code for robustness
        let query = { phone };
        if (phone.startsWith('+')) {
             // If input has prefix (e.g. +91), also check if DB has it without prefix (legacy)
             // This assumes the prefix length is variable, but typically we might just check strict equality or contains
             // For now, let's just do a direct check. 
             // Ideally we should strip country code to find match, but that's complex without lib.
             // We can check if DB has phone as substring? No.
             // Let's stick to the logic used in authController:
             // If input is +919999999999, check if DB has 9999999999.
             // We can strip non-digits.
             const digits = phone.replace(/\D/g, ''); 
             // If digits length > 10, maybe it has country code.
             // If input is +91-999... -> 91999...
             // If DB has 999..., we won't find it with exact match.
             
             // Simplest approach compatible with authController:
             // If input starts with +91, try finding without it.
             if (phone.startsWith('+91')) {
                 const withoutPrefix = phone.slice(3);
                 query = { $or: [{ phone: phone }, { phone: withoutPrefix }] };
             }
        } else {
             // If input has no +, check if DB has +91 prefix
             query = { $or: [{ phone: phone }, { phone: '+91' + phone }] };
        }

        const user = await User.findOne(query);
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