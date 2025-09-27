const Notification = require('../models/notificationModel');
const User = require('../models/userModel');

// This is a placeholder for a real push notification service
// In a real application, you would integrate a service like Firebase Cloud Messaging (FCM)
const sendPushNotification = async (message, target) => {
    console.log(`Sending push notification to target ${target}: ${message}`);
};

/**
 * Creates and saves a notification.
 * Can target a specific user, a role, or all users.
 */
exports.sendNotification = async (req, res) => {
    const { message, userId, role, ttlMinutes = 1440 } = req.body; // Default TTL is 24 hours

    try {
        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const ttlDate = new Date(Date.now() + ttlMinutes * 60 * 1000);
        const target = (userId || role) ? 'user' : 'admin'; // Basic target logic

        // Handle sending to a specific user
        if (userId) {
            const newNotification = new Notification({
                message,
                userId,
                target,
                ttl: ttlDate
            });
            await newNotification.save();
        } 
        // Handle sending to all users with a specific role
        else if (role) {
            const users = await User.find({ roles: role });
            for (const user of users) {
                const newNotification = new Notification({
                    message,
                    userId: user._id,
                    role,
                    target,
                    ttl: ttlDate
                });
                await newNotification.save();
            }
        } 
        // Handle sending to all admins (if no specific user/role)
        else {
            const admins = await User.find({ roles: { $in: ['admin', 'super-admin']} });
             for (const admin of admins) {
                const newNotification = new Notification({
                    message,
                    userId: admin._id,
                    target: 'admin',
                    ttl: ttlDate
                });
                await newNotification.save();
            }
        }

        // Trigger push notification logic
        await sendPushNotification(message, target);

        res.status(201).json({ message: 'Notification sent successfully' });

    } catch (error) {
        console.error("Error sending notification:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Fetches notifications for the currently logged-in user.
 */
exports.getUserNotifications = async (req, res) => {
    const userId = req.user.id;
    try {
        // Find notifications where the TTL has not expired yet
        const notifications = await Notification.find({ 
            userId,
            ttl: { $gt: new Date() } 
        }).sort({ createdAt: -1 });
        
        res.status(200).json(notifications || []);
    } catch (error) {
        console.error("Error fetching user notifications:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};