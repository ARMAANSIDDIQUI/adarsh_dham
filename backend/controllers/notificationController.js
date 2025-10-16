const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const webpush = require('web-push');

exports.sendNotification = async (req, res) => {
    const { message, userId, role, targetGroup, ttlMinutes = 1440, sendAt } = req.body;

    try {
        if (!message) {
            return res.status(400).json({ message: 'Message is required.' });
        }

        const sendDate = sendAt ? new Date(sendAt) : new Date();
        if (isNaN(sendDate.getTime())) {
            return res.status(400).json({ message: 'Invalid sendAt date format.' });
        }
        
        const isScheduled = sendAt && sendDate > new Date();

        let targetUsers = [];
        if (targetGroup === 'user' && userId) {
            const user = await User.findById(userId);
            if (user) targetUsers.push(user);
        } else if (targetGroup === 'role' && role) {
            targetUsers = await User.find({ roles: role });
        } else if (targetGroup === 'all') {
            targetUsers = await User.find({});
        } else {
            targetUsers = await User.find({ roles: { $in: ['admin', 'super-admin'] } });
        }

        if (targetUsers.length === 0) {
            return res.status(404).json({ message: 'No target users were found for the specified criteria.' });
        }

        const notificationTargetType = targetGroup === 'user' ? 'user' : targetGroup === 'role' ? 'admin' : 'all';

        const notificationsToSave = targetUsers.map(user => ({
            message,
            userId: user._id,
            role,
            target: notificationTargetType,
            ttl: new Date(sendDate.getTime() + ttlMinutes * 60 * 1000),
            sendAt: isScheduled ? sendDate : null,
            status: isScheduled ? 'scheduled' : 'sent',
        }));

        await Notification.insertMany(notificationsToSave);

        const successMessage = isScheduled
            ? `Notification successfully scheduled for ${targetUsers.length} user(s).`
            : `Notification sent immediately to ${targetUsers.length} user(s).`;
            
        if (!isScheduled) {
            const pushSubscriptions = targetUsers.filter(user => user.pushSubscription).map(user => user.pushSubscription);
            if (pushSubscriptions.length > 0) {
                const payload = JSON.stringify({
                    title: "Adarsh Dham: New Update",
                    body: message,
                });
                const sendPromises = pushSubscriptions.map(sub =>
                    webpush.sendNotification(sub, payload).catch(err => {
                        console.error(`Error sending push notification, it might be expired: ${err.message}`);
                    })
                );
                await Promise.all(sendPromises);
            }
        }

        res.status(201).json({ message: successMessage });
    } catch (error) {
        console.error("Error in sendNotification:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getUserNotifications = async (req, res) => {
    const userId = req.user.id;
    try {
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

exports.subscribe = async (req, res) => {
    const subscription = req.body;
    const userId = req.user.id;
    try {
        await User.findByIdAndUpdate(userId, { $set: { pushSubscription: subscription } });
        res.status(200).json({ message: 'Web Push subscription saved successfully.' });
    } catch (error) {
        console.error("Error saving Web Push subscription:", error);
        res.status(500).json({ message: 'Could not save Web Push subscription.' });
    }
};

exports.unsubscribe = async (req, res) => {
    const userId = req.user.id;
    try {
        await User.findByIdAndUpdate(userId, { $set: { pushSubscription: null } });
        res.status(200).json({ message: 'Web Push subscription removed successfully.' });
    } catch (error) {
        console.error("Error removing Web Push subscription:", error);
        res.status(500).json({ message: 'Could not remove Web Push subscription.' });
    }
};