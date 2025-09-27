const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const { sendFcmNotification } = require('../utils/fcmManager'); // ADDED: Import the FCM manager

/**
 * Creates and saves a notification.
 * Can target a specific user, a role, or all users.
 * Also sends an OS-level push notification via FCM.
 */
exports.sendNotification = async (req, res) => {
    const { message, userId, role, ttlMinutes = 1440 } = req.body; // Default TTL is 24 hours

    try {
        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const ttlDate = new Date(Date.now() + ttlMinutes * 60 * 1000);
        
        let targetUsers = [];
        let title = "Adarsh Dham: New Update";
        let body = message;

        // Handle finding target users based on the request
        if (userId) {
            const user = await User.findById(userId);
            if (user) {
                targetUsers.push(user);
            }
        } else if (role) {
            targetUsers = await User.find({ roles: role });
        } else {
            const admins = await User.find({ roles: { $in: ['admin', 'super-admin']} });
            targetUsers.push(...admins);
        }
        
        const fcmTokens = [];
        
        // Loop through all target users to create in-website notifications and collect FCM tokens
        for (const user of targetUsers) {
            const newNotification = new Notification({
                message,
                userId: user._id,
                role: role,
                target: userId ? 'user' : 'admin',
                ttl: ttlDate
            });
            await newNotification.save();
            
            // Collect tokens for OS-level push notifications
            if (user.fcmTokens && user.fcmTokens.length > 0) {
                fcmTokens.push(...user.fcmTokens);
            }
        }
        
        // Send OS-level push notification via FCM
        if (fcmTokens.length > 0) {
            await sendFcmNotification(fcmTokens, title, body, {
                notificationType: 'generalUpdate', // Custom data for client-side handling
            });
        }
        
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