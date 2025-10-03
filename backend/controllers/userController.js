const User = require('../models/userModel');
const bcrypt = require('bcrypt');

// @desc    Update current user's profile (name)
// @route   PUT /api/users/profile
// @access  Private
exports.updateMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            const updatedUser = await user.save();
            
            // Return the updated user object (without the password hash)
            res.json({
                id: updatedUser._id,
                name: updatedUser.name,
                phone: updatedUser.phone,
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

// @desc    Change current user's password
// @route   PUT /api/users/change-password
// @access  Private
exports.changeMyPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Please provide both current and new passwords.' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password.' });
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