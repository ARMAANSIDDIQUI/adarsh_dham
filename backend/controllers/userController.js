const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const OTP = require('../models/otpModel');

// @desc    Update current user's profile (name)
// @route   PUT /api/users/profile
// @access  Private
exports.updateMyProfile = async (req, res) => {
    try {
        console.log('Update Profile Request for ID:', req.user.id);
        const user = await User.findById(req.user.id);
        console.log('User found in DB:', user ? 'Yes' : 'No');

        if (user) {
            user.name = req.body.name || user.name;

            const updatedUser = await user.save();

            // Return the updated user object (without the password hash)
            res.json({
                id: updatedUser._id,
                name: updatedUser.name,
                phone: updatedUser.phone,
                email: updatedUser.email,
                isEmailVerified: updatedUser.isEmailVerified,
                roles: updatedUser.roles,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: 'Server error updating profile.' });
    }
};

// @desc    Verify or update current user's email
// @route   PUT /api/users/verify-email
// @access  Private
exports.verifyMyEmail = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required.' });
        }

        // Verify OTP
        const otpRecord = await OTP.findOne({ email, otp, type: 'update' });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        // Check if email taken
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser._id.toString() !== user._id.toString()) {
            return res.status(400).json({ message: 'Email already in use.' });
        }

        user.email = email;
        user.isEmailVerified = true;
        await OTP.deleteOne({ _id: otpRecord._id });

        const updatedUser = await user.save();

        res.json({
            id: updatedUser._id,
            name: updatedUser.name,
            phone: updatedUser.phone,
            email: updatedUser.email,
            isEmailVerified: updatedUser.isEmailVerified,
            roles: updatedUser.roles,
        });
    } catch (error) {
        console.error("Error verifying email:", error);
        res.status(500).json({ message: 'Server error verifying email.' });
    }
};

// @desc    Change current user's password
// @route   PUT /api/users/change-password
// @access  Private
exports.changeMyPassword = async (req, res) => {
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ message: 'Please provide a new password.' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: 'Server error changing password.' });
    }
};