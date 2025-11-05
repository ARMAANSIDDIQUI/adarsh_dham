// // const Notification = require('../models/notificationModel');
// // const User = require('../models/userModel');
// // const webpush = require('web-push');

// // exports.sendNotification = async (req, res) => {
// //     const { message, userId, role, targetGroup, ttlMinutes = 1440, sendAt } = req.body;

// //     try {
// //         if (!message) {
// //             return res.status(400).json({ message: 'Message is required.' });
// //         }

// //         const sendDate = sendAt ? new Date(sendAt) : new Date();
// //         if (isNaN(sendDate.getTime())) {
// //             return res.status(400).json({ message: 'Invalid sendAt date format.' });
// //         }
        
// //         const isScheduled = sendAt && sendDate > new Date();

// //         let targetUsers = [];
// //         if (targetGroup === 'user' && userId) {
// //             const user = await User.findById(userId);
// //             if (user) targetUsers.push(user);
// //         } else if (targetGroup === 'role' && role) {
// //             targetUsers = await User.find({ roles: role });
// //         } else if (targetGroup === 'all') {
// //             targetUsers = await User.find({});
// //         } else {
// //             targetUsers = await User.find({ roles: { $in: ['admin', 'super-admin'] } });
// //         }

// //         if (targetUsers.length === 0) {
// //             return res.status(404).json({ message: 'No target users were found for the specified criteria.' });
// //         }

// //         const notificationTargetType = targetGroup === 'user' ? 'user' : targetGroup === 'role' ? 'admin' : 'all';

// //         const notificationsToSave = targetUsers.map(user => ({
// //             message,
// //             userId: user._id,
// //             role,
// //             target: notificationTargetType,
// //             ttl: new Date(sendDate.getTime() + ttlMinutes * 60 * 1000),
// //             sendAt: isScheduled ? sendDate : null,
// //             status: isScheduled ? 'scheduled' : 'sent',
// //         }));

// //         await Notification.insertMany(notificationsToSave);

// //         const successMessage = isScheduled
// //             ? `Notification successfully scheduled for ${targetUsers.length} user(s).`
// //             : `Notification sent immediately to ${targetUsers.length} user(s).`;
            
// //         if (!isScheduled) {
// //             const pushSubscriptions = targetUsers.filter(user => user.pushSubscription).map(user => user.pushSubscription);
// //             if (pushSubscriptions.length > 0) {
// //                 const payload = JSON.stringify({
// //                     title: "Adarsh Dham: New Update",
// //                     body: message,
// //                 });
// //                 const sendPromises = pushSubscriptions.map(sub =>
// //                     webpush.sendNotification(sub, payload).catch(err => {
// //                         console.error(`Error sending push notification, it might be expired: ${err.message}`);
// //                     })
// //                 );
// //                 await Promise.all(sendPromises);
// //             }
// //         }

// //         res.status(201).json({ message: successMessage });
// //     } catch (error) {
// //         console.error("Error in sendNotification:", error);
// //         res.status(500).json({ message: 'Server error', error: error.message });
// //     }
// // };

// // exports.getUserNotifications = async (req, res) => {
// //     const userId = req.user.id;
// //     try {
// //         const notifications = await Notification.find({ 
// //             userId,
// //             ttl: { $gt: new Date() } 
// //         }).sort({ createdAt: -1 });
        
// //         res.status(200).json(notifications || []);
// //     } catch (error) {
// //         console.error("Error fetching user notifications:", error);
// //         res.status(500).json({ message: 'Server error', error: error.message });
// //     }
// // };

// // exports.subscribe = async (req, res) => {
// //     const subscription = req.body;
// //     const userId = req.user.id;
// //     try {
// //         await User.findByIdAndUpdate(userId, { $set: { pushSubscription: subscription } });
// //         res.status(200).json({ message: 'Web Push subscription saved successfully.' });
// //     } catch (error) {
// //         console.error("Error saving Web Push subscription:", error);
// //         res.status(500).json({ message: 'Could not save Web Push subscription.' });
// //     }
// // };

// // exports.unsubscribe = async (req, res) => {
// //     const userId = req.user.id;
// //     try {
// //         await User.findByIdAndUpdate(userId, { $set: { pushSubscription: null } });
// //         res.status(200).json({ message: 'Web Push subscription removed successfully.' });
// //     } catch (error) {
// //         console.error("Error removing Web Push subscription:", error);
// //         res.status(500).json({ message: 'Could not remove Web Push subscription.' });
// //     }
// // };







// const Notification = require('../models/notificationModel');
// const User = require('../models/userModel');
// const webpush = require('web-push');

// /**
//  * Send or schedule a notification
//  */
// exports.sendNotification = async (req, res) => {
//   const { message, userId, phone, role, targetGroup, ttlMinutes = 1440, sendAt } = req.body;

//   try {
//     if (!message) {
//       return res.status(400).json({ message: 'Message is required.' });
//     }

//     const sendDate = sendAt ? new Date(sendAt) : new Date();
//     if (isNaN(sendDate.getTime())) {
//       return res.status(400).json({ message: 'Invalid sendAt date format.' });
//     }

//     const isScheduled = sendAt && sendDate > new Date();

//     // 🔍 Target user lookup logic
//     let targetUsers = [];

//     if (targetGroup === 'user' && userId) {
//       const user = await User.findById(userId);
//       if (user) targetUsers.push(user);

//     } else if (targetGroup === 'phone' && phone) {
//       // Support single or multiple phone numbers
//       const phoneList = Array.isArray(phone) ? phone : [phone];
//       targetUsers = await User.find({ phone: { $in: phoneList } });

//     } else if (targetGroup === 'role' && role) {
//       targetUsers = await User.find({ roles: role });

//     } else if (targetGroup === 'all') {
//       targetUsers = await User.find({});

//     } else {
//       // Default: all admins & super-admins
//       targetUsers = await User.find({ roles: { $in: ['admin', 'super-admin'] } });
//     }

//     if (targetUsers.length === 0) {
//       return res.status(404).json({ message: 'No target users were found for the specified criteria.' });
//     }

//     const notificationTargetType =
//       targetGroup === 'user'
//         ? 'user'
//         : targetGroup === 'phone'
//           ? 'phone'
//           : targetGroup === 'role'
//             ? 'role'
//             : 'all';

//     // Prepare notifications for each target user
//     const notificationsToSave = targetUsers.map(user => ({
//       message,
//       userId: user._id,
//       role: role || undefined,
//       target: notificationTargetType,
//       ttl: new Date(sendDate.getTime() + ttlMinutes * 60 * 1000),
//       sendAt: isScheduled ? sendDate : null,
//       status: isScheduled ? 'scheduled' : 'sent',
//     }));

//     await Notification.insertMany(notificationsToSave);

//     const successMessage = isScheduled
//       ? `Notification successfully scheduled for ${targetUsers.length} user(s).`
//       : `Notification sent immediately to ${targetUsers.length} user(s).`;

//     // 🚀 If not scheduled, send immediately via Web Push
//     if (!isScheduled) {
//       const pushSubscriptions = targetUsers
//         .filter(user => user.pushSubscription)
//         .map(user => user.pushSubscription);

//       if (pushSubscriptions.length > 0) {
//         const payload = JSON.stringify({
//           title: 'Adarsh Dham: New Update',
//           body: message,
//         });

//         const sendPromises = pushSubscriptions.map(sub =>
//           webpush.sendNotification(sub, payload).catch(err => {
//             console.error(`Push notification failed: ${err.message}`);
//           })
//         );

//         await Promise.all(sendPromises);
//       }
//     }

//     res.status(201).json({ message: successMessage });
//   } catch (error) {
//     console.error('Error in sendNotification:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// /**
//  * Get user notifications (active ones only)
//  */
// exports.getUserNotifications = async (req, res) => {
//   const userId = req.user.id;
//   try {
//     const notifications = await Notification.find({
//       userId,
//       ttl: { $gt: new Date() },
//     }).sort({ createdAt: -1 });

//     res.status(200).json(notifications || []);
//   } catch (error) {
//     console.error('Error fetching user notifications:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// /**
//  * Subscribe user to web push
//  */
// exports.subscribe = async (req, res) => {
//   const subscription = req.body;
//   const userId = req.user.id;
//   try {
//     await User.findByIdAndUpdate(userId, { $set: { pushSubscription: subscription } });
//     res.status(200).json({ message: 'Web Push subscription saved successfully.' });
//   } catch (error) {
//     console.error('Error saving Web Push subscription:', error);
//     res.status(500).json({ message: 'Could not save Web Push subscription.' });
//   }
// };

// /**
//  * Unsubscribe user from web push
//  */
// exports.unsubscribe = async (req, res) => {
//   const userId = req.user.id;
//   try {
//     await User.findByIdAndUpdate(userId, { $set: { pushSubscription: null } });
//     res.status(200).json({ message: 'Web Push subscription removed successfully.' });
//   } catch (error) {
//     console.error('Error removing Web Push subscription:', error);
//     res.status(500).json({ message: 'Could not remove Web Push subscription.' });
//   }
// };










const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const webpush = require('web-push');

/**
 * --- THIS IS THE NEW, UNIFIED QUERY HELPER ---
 * It finds all notifications this user is allowed to see.
 */
const getUnifiedNotificationQuery = (userId, userRoles) => {
  // --- THIS IS THE FIX ---
  // We only want to search for *group* targets (admin, operator, etc.)
  // We must filter out the 'user' role from the target search.
  const groupRoles = userRoles.filter(role => role !== 'user');
  // --- END FIX ---

  return {
    $or: [
      { userId: userId },             // 1. Sent directly to me
      { target: { $in: groupRoles } }, // 2. Sent to one of my *group* roles
      { target: 'all' }             // 3. Sent to all
    ]
  };
};

/**
 * Send or schedule a notification (Admin action)
 */
exports.sendNotification = async (req, res) => {
  const { message, userId, phones, targetGroup, ttlMinutes = 1440, sendAt } = req.body;

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
    let effectiveTargetGroup = targetGroup;

    // 1. Find users
    if (userId) {
      const user = await User.findById(userId);
      if (user) targetUsers.push(user);
      effectiveTargetGroup = 'user'; 
    } else if (phones && phones.length > 0) {
      const phoneList = Array.isArray(phones) ? phones : [phones];
      const trimmedPhoneList = phoneList.map(p => typeof p === 'string' ? p.trim() : p).filter(p => p); 
      
      if (trimmedPhoneList.length > 0) {
        targetUsers = await User.find({ phone: { $in: trimmedPhoneList } });
      }
      effectiveTargetGroup = 'user'; 
    } else if (targetGroup && targetGroup !== 'all' && targetGroup !== 'roles') { 
      targetUsers = await User.find({ roles: targetGroup });
    } else if (targetGroup === 'all') {
      targetUsers = await User.find({});
      effectiveTargetGroup = 'all';
    } else {
      // Default: send to admins if all else is blank
      targetUsers = await User.find({ roles: { $in: ['admin', 'super-admin'] } });
      effectiveTargetGroup = 'admin';
    }

    if (targetUsers.length === 0) {
      console.warn(`[sendNotification] No target users were found. Data:`, { userId, phones, targetGroup });
      return res.status(404).json({ message: 'No target users were found for the specified criteria.' });
    }

    // 2. Create a notification document *for each user*
    const notificationsToSave = targetUsers.map(user => ({
      message,
      userId: user._id,
      read: false,
      target: effectiveTargetGroup, 
      ttl: new Date(sendDate.getTime() + ttlMinutes * 60 * 1000),
      sendAt: isScheduled ? sendDate : null,
      status: isScheduled ? 'scheduled' : 'sent',
    }));

    await Notification.insertMany(notificationsToSave);

    const successMessage = isScheduled
      ? `Notification scheduled for ${targetUsers.length} user(s).`
      : `Notification sent immediately to ${targetUsers.length} user(s).`;

    // 3. Send Web Push if not scheduled
    if (!isScheduled) {
      const pushSubscriptions = targetUsers
        .filter(user => user.pushSubscription)
        .map(user => user.pushSubscription);

      if (pushSubscriptions.length > 0) {
        const payload = JSON.stringify({
          title: 'Adarsh Dham: New Update',
          body: message,
        });
        const sendPromises = pushSubscriptions.map(sub =>
          webpush.sendNotification(sub, payload).catch(err => {
            console.error(`Push notification failed: ${err.message}`);
          })
        );
        await Promise.all(sendPromises);
      }
    }

    res.status(201).json({ message: successMessage });
  } catch (error) {
    console.error('Error in sendNotification:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


/**
 * Get user notifications (active ones only)
 */
exports.getUserNotifications = async (req, res) => {
  const userId = req.user.id;
  const userRoles = req.user.roles || []; 

  try {
    // The helper function now correctly filters roles
    const query = getUnifiedNotificationQuery(userId, userRoles); 
    query.ttl = { $gt: new Date() };
    query.status = 'sent';
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 });

    res.status(200).json(notifications || []);
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get the count of unread notifications for the current user.
 */
exports.getUnreadCount = async (req, res) => {
  const userId = req.user.id;
  const userRoles = req.user.roles || [];

  try {
    const query = getUnifiedNotificationQuery(userId, userRoles);
    query.ttl = { $gt: new Date() };
    query.status = 'sent';
    query.read = false; 

    const count = await Notification.countDocuments(query);
    
    res.status(200).json({ count });
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Mark all of the user's notifications as read.
 */
exports.markAllAsRead = async (req, res) => {
  const userId = req.user.id;
  const userRoles = req.user.roles || []; 

  try {
    const query = getUnifiedNotificationQuery(userId, userRoles);
    query.read = false;
    query.ttl = { $gt: new Date() };
    query.status = 'sent';

    const result = await Notification.updateMany(query, { $set: { read: true } }); 
    
    console.log(`[markAllAsRead] User ${userId} | Roles: ${userRoles.join(', ')} | Modified ${result.modifiedCount} documents.`);
    
    res.status(200).json({ message: 'All notifications marked as read.', modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Mark a single notification as read.
 */
exports.markOneAsRead = async (req, res) => {
  const { id } = req.params; // Notification _id
  const userId = req.user.id;
  const userRoles = req.user.roles || [];

  try {
    const query = getUnifiedNotificationQuery(userId, userRoles);
    query._id = id;
    query.ttl = { $gt: new Date() };
    query.status = 'sent';


    const updatedNotification = await Notification.findOneAndUpdate(
      query,
      { $set: { read: true } },
      { new: true } // Return the updated document
    );

    if (!updatedNotification) {
      console.warn(`[markOneAsRead] Failed to find notification ${id} for user ${userId}. Query failed.`);
      return res.status(404).json({ message: 'Notification not found or you do not have permission to update it.' });
    }
    
    console.log(`[markOneAsRead] User ${userId} marked notification ${id} as read.`);
    res.status(200).json({ message: 'Notification marked as read.', notification: updatedNotification });

  } catch (error) {
    console.error('Error marking one notification as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Subscribe user to web push
 */
exports.subscribe = async (req, res) => {
  const subscription = req.body;
  const userId = req.user.id;
  try {
    await User.findByIdAndUpdate(userId, { $set: { pushSubscription: subscription } });
    res.status(200).json({ message: 'Web Push subscription saved successfully.' });
  } catch (error) {
    console.error('Error saving Web Push subscription:', error);
    res.status(500).json({ message: 'Could not save Web Push subscription.' });
  }
};

/**
 * Unsubscribe user from web push
 */
exports.unsubscribe = async (req, res) => {
  const userId = req.user.id;
  try {
    await User.findByIdAndUpdate(userId, { $set: { pushSubscription: null } });
    res.status(200).json({ message: 'Web Push subscription removed successfully.' });
  } catch (error) {
    console.error('Error removing Web Push subscription:', error);
    res.status(500).json({ message: 'Could not remove Web Push subscription.' });
  }
};