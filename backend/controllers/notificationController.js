const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
// NOTE: Make sure the path to your fcmManager.js file is correct.
const { sendFcmNotification } = require('../utils/fcmManager'); 

/**
 * Creates and saves a notification.
 * Can target a specific user, a role, or all users.
 * Also sends an OS-level push notification via FCM.
 */
exports.sendNotification = async (req, res) => {
    // ttlMinutes is the Time-To-Live in minutes for the in-website notification
    const { message, userId, role, ttlMinutes = 1440 } = req.body; 

    try {
        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const ttlDate = new Date(Date.now() + ttlMinutes * 60 * 1000);
        
        let targetUsers = [];
        let title = "Adarsh Dham: New Update";
        let body = message;

        // --- 1. Find Target Users ---
        if (userId) {
            const user = await User.findById(userId);
            if (user) {
                targetUsers.push(user);
            }
        } else if (role) {
            // Find users based on the provided role
            targetUsers = await User.find({ roles: role });
        } else {
            // Default: Send to all admins if no specific user/role is provided
            const admins = await User.find({ roles: { $in: ['admin', 'super-admin']} });
            targetUsers.push(...admins);
        }
        
        const fcmTokens = [];
        
        // --- 2. Create In-Website Notifications and Collect Tokens ---
        for (const user of targetUsers) {
            // Create and save the notification record in MongoDB
            const newNotification = new Notification({
                message,
                userId: user._id,
                role: role,
                target: userId ? 'user' : 'admin',
                ttl: ttlDate
            });
            await newNotification.save();
            
            // Collect tokens for the OS-level push notification
            if (user.fcmTokens && user.fcmTokens.length > 0) {
                fcmTokens.push(...user.fcmTokens);
            }
        }
        
        // --- 3. Send OS-level Push Notification via FCM ---
        if (fcmTokens.length > 0) {
            await sendFcmNotification(fcmTokens, title, body, {
                // Custom data payload (e.g., booking ID, type of update)
                notificationType: 'generalUpdate', 
            });
        }
        
        res.status(201).json({ message: 'Notification sent successfully (both in-app and push).' });

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