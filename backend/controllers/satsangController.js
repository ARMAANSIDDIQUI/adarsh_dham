const LiveLink = require('../models/liveLinkModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const webpush = require('web-push');

/**
 * Creates and saves an in-app notification and sends an OS-level push notification if immediate.
 * This is an internal helper function for this controller.
 */
const createAndSaveNotification = async ({ message, userIds = [], notifyAdmins = false, notifyAllUsers = false, sendAt, ttlMinutes = 10080 }) => {
    try {
        let targetUsers = [];

        if (notifyAllUsers) {
            targetUsers = await User.find({});
        } else if (notifyAdmins) {
            const admins = await User.find({ roles: { $in: ['admin', 'super-admin'] } });
            targetUsers.push(...admins);
        }
        
        if (userIds.length > 0) {
            const users = await User.find({ _id: { $in: userIds } });
            targetUsers.push(...users);
        }

        if (targetUsers.length === 0) return;

        // Use a Map to ensure unique users by their ID
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
                target: 'user',
                ttl: ttlDate,
                sendAt: isScheduled ? sendDate : null,
                status: isScheduled ? 'scheduled' : 'sent',
            });

            if (!isScheduled && user.pushSubscription) {
                pushSubscriptions.push(user.pushSubscription);
            }
        }

        await Notification.insertMany(notifications);

        if (!isScheduled && pushSubscriptions.length > 0) {
            const payload = JSON.stringify({
                title: "Adarsh Dham: New Satsang",
                body: message,
            });

            const sendPromises = pushSubscriptions.map(sub => 
                webpush.sendNotification(sub, payload).catch(err => {
                    console.error(`Error sending push notification to a subscription: ${err.message}`);
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

// Main controller functions
exports.createLiveLink = async (req, res) => {
    try {
        const newLiveLink = new LiveLink(req.body);
        await newLiveLink.save();

        // Notify all users about the new live link/satsang
        const message = `A new Satsang is live! Join "${newLiveLink.name}" now.`;
        const notificationPayload = {
            message,
            notifyAllUsers: true,
        };
        await createAndSaveNotification(notificationPayload);

        res.status(201).json({ message: 'Live link created successfully', link: newLiveLink });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getLiveLinks = async (req, res) => {
    try {
        const liveLinks = await LiveLink.find();
        res.status(200).json(liveLinks || []);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getActiveLiveLinks = async (req, res) => {
    try {
        const now = new Date();
        const liveLinks = await LiveLink.find({ 
            liveFrom: { $lte: now }, 
            liveTo: { $gte: now } 
        });
        res.status(200).json(liveLinks || []);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateLiveLink = async (req, res) => {
    try {
        const link = await LiveLink.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!link) {
            return res.status(404).json({ message: 'Live link not found' });
        }
        res.status(200).json({ message: 'Live link updated successfully', link });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteLiveLink = async (req, res) => {
    try {
        const deletedLink = await LiveLink.findByIdAndDelete(req.params.id);
        if (!deletedLink) {
            return res.status(404).json({ message: 'Live link not found' });
        }
        res.status(200).json({ message: 'Live link deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};