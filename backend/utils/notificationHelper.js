const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const webpush = require('web-push');

/**
 * Creates an in-app notification and sends an OS-level push notification if it is immediate.
 */
exports.createAndSaveNotification = async ({ message, userIds = [], targetGroup, sendAt, ttlMinutes = 1440 }) => {
    try {
        let targetUsers = [];
        let effectiveTarget = targetGroup || 'user'; // Default

        // 1. Find users
        if (userIds.length > 0) {
            // If userIds are provided, find those users
            const users = await User.find({ _id: { $in: userIds } });
            targetUsers.push(...users);
            
            // --- THIS IS THE FIX ---
            // If we are sending to a specific list of IDs,
            // the target for each notification is 'user', not the group name.
            effectiveTarget = 'user';
            // --- END FIX ---

        } else if (targetGroup) {
            // If no userIds, find users by the targetGroup role
            const groupUsers = await User.find({ roles: targetGroup });
            targetUsers.push(...groupUsers);
            effectiveTarget = targetGroup; // Target is 'admin', 'all', etc.
        } else {
            return; // No one to notify
        }

        if (targetUsers.length === 0) return;

        // De-duplicate users
        const uniqueTargetUsers = [...new Map(targetUsers.map(user => [user._id.toString(), user])).values()];

        const sendDate = sendAt ? new Date(sendAt) : new Date();
        const ttlDate = new Date(sendDate.getTime() + ttlMinutes * 60 * 1000);
        const isScheduled = sendAt && sendDate > new Date();

        const notifications = [];
        const pushSubscriptions = [];

        for (const user of uniqueTargetUsers) {
            notifications.push({
                message,
                userId: user._id,
                // We ONLY save to the 'target' field, using our corrected logic.
                target: effectiveTarget, 
                ttl: ttlDate,
                sendAt: isScheduled ? sendDate : null,
                status: isScheduled ? 'scheduled' : 'sent',
                read: false
            });

            if (!isScheduled && user.pushSubscription) {
                pushSubscriptions.push(user.pushSubscription);
            }
        }

        await Notification.insertMany(notifications);

        if (!isScheduled && pushSubscriptions.length > 0) {
            const payload = JSON.stringify({
                title: "Adarsh Dham: New Update",
                body: message,
                icon: '/VM401196.png',
                url: '/notifications'
            });

            const sendPromises = pushSubscriptions.map(sub => 
                webpush.sendNotification(sub, payload).catch(err => {
                    // Don't log 410 errors as they are common
                    if (err.statusCode !== 410) {
                        console.error(`Error sending push notification to a subscription: ${err.message}`);
                    }
                })
            );
            await Promise.all(sendPromises);
        }

        if (!isScheduled) {
            console.log(`Immediate notification created for ${uniqueTargetUsers.length} user(s).`);
        }
    } catch (error) {
        console.error("Failed to create and save notification:", error);
    }
};