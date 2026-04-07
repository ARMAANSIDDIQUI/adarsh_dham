const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const schedule = require('node-schedule');
const webpush = require('web-push');
const path = require("path");

require('dotenv').config();

// Mongoose Models
const Notification = require('./models/notificationModel');
const User = require('./models/userModel');
const Event = require('./models/eventModel');
const Person = require('./models/peopleModel');
const Booking = require('./models/bookingModel');
const bcrypt = require('bcrypt');

//Routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const satsangRoutes = require('./routes/satsangRoutes');
const buildingRoutes = require('./routes/buildingRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bedRoutes = require('./routes/bedRoutes');
const peopleRoutes = require('./routes/peopleRoutes');
const structureRoutes = require('./routes/structureRoutes');
const passwordRequestRoutes = require('./routes/passwordRequestRoutes');
const commentRoutes = require('./routes/commentRoutes');
const userRoutes = require('./routes/userRoutes');
const emailRoutes = require('./routes/emailRoutes');

// --- NEW HELPER IMPORT ---
const { createAndSaveNotification } = require('./utils/notificationHelper');

const app = express();
const PORT = process.env.PORT || 5000;

// Set VAPID details for web-push
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

//SECURE CORS CONFIGURATION
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://adarsh-dham-frontend.vercel.app',
  'https://adarshdham.com',
  'https://adarshdham.vercel.app',
  // Vercel single deployment — all *.vercel.app subdomains
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  process.env.FRONTEND_URL || null,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('This domain is not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    // createFirstSuperAdmin();
    setupAllocationResetJob();
    setupScheduledNotificationJob();
    setupPendingBookingCheckJob();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// const createFirstSuperAdmin = async () => {
//  const superAdminPhone = process.env.SUPER_ADMIN_PHONE || '8938083411';
//  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'shivani11cr';

//  try {
//       const existingSuperAdmin = await User.findOne({ phone: superAdminPhone });
//       if (existingSuperAdmin) {
//          console.log('Super admin already exists. No new account was created.');
//          return;
//       }

//       const salt = await bcrypt.genSalt(10);
//       const passwordHash = await bcrypt.hash(superAdminPassword, salt);

//       const newSuperAdmin = new User({
//          name: 'Shivani',
//          phone: superAdminPhone,
//          passwordHash,
//          roles: ['user', 'super-admin', 'admin', 'super-operator', 'operator', 'satsang-operator']
//       });

//       await newSuperAdmin.save();
//       console.log('Initial Super Admin account created successfully.');
//  } catch (error) {
//       console.error('Error creating initial Super Admin:', error);
//  }
// };

const setupAllocationResetJob = () => {
  schedule.scheduleJob('0 0 * * *', async () => {
    console.log('Running nightly job to clear old occupancy data...');
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    try {
      const completedEvents = await Event.find({ endDate: { $lte: twoDaysAgo } });
      const completedEventIds = completedEvents.map(event => event._id);

      if (completedEventIds.length > 0) {
        const result = await Person.deleteMany({ eventId: { $in: completedEventIds } });
        console.log(`Nightly job completed. Cleared ${result.deletedCount} person records from completed events.`);
      } else {
        console.log('Nightly job completed. No old events found to clear.');
      }
    } catch (error) {
      console.error('Error during nightly occupancy reset job:', error);
    }
  });
};

const setupScheduledNotificationJob = () => {
  schedule.scheduleJob('* * * * *', async () => {
    console.log('Checking for scheduled notifications...');
    try {
      const now = new Date();
      const notificationsToSend = await Notification.find({
        status: 'scheduled',
        sendAt: { $lte: now }
      }).populate('userId', 'pushSubscription');

      if (notificationsToSend.length > 0) {
        console.log(`Found ${notificationsToSend.length} notifications to send.`);
        const pushPromises = notificationsToSend.map(async (notification) => {
          const user = notification.userId;
          if (user && user.pushSubscription) {
            const payload = JSON.stringify({
              title: "Adarsh Dham: New Update",
              body: notification.message,
            });
            try {
              await webpush.sendNotification(user.pushSubscription, payload);
              notification.status = 'sent';
              await notification.save();
              console.log(`Notification sent to user: ${user._id}`);
            } catch (err) {
              console.error(`Error sending push notification to user ${user._id}: ${err.message}`);
              if (err.statusCode === 410) {
                user.pushSubscription = null;
                await user.save();
                console.log(`Invalid subscription removed for user: ${user._id}`);
              }
            }
          } else {
            notification.status = 'sent';
            await notification.save();
            console.log(`No valid subscription found for notification ${notification._id}, marked as sent.`);
          }
        });
        await Promise.all(pushPromises);
      }
    } catch (error) {
      console.error('Error in scheduled notification job:', error);
    }
  });
};

// --- NEW FUNCTION ---
const setupPendingBookingCheckJob = () => {
  // Runs every 30 minutes
  schedule.scheduleJob('*/30 * * * *', async () => {
    console.log('Running 30-minute check for pending bookings...');
    try {
      // Find events that are NOT over (active events)
      // An event is over if endDate < now. So active events have endDate >= now.
      const activeEvents = await Event.find({ endDate: { $gte: new Date() } }).select('_id');
      const activeEventIds = activeEvents.map(e => e._id);

      // Count pending bookings for active events only
      const pendingCount = await Booking.countDocuments({
        status: 'pending',
        eventId: { $in: activeEventIds }
      });

      if (pendingCount > 0) {
        console.log(`Found ${pendingCount} pending bookings for active events. Notifying operators.`);

        // Find all users with the required roles
        const targetRoles = ['admin', 'super-admin', 'operator', 'super-operator'];
        const adminAndOperatorUsers = await User.find({ roles: { $in: targetRoles } });
        const userIds = adminAndOperatorUsers.map(user => user._id.toString());

        if (userIds.length > 0) {
          // Send one notification to each admin/operator
          await createAndSaveNotification({
            message: `There ${pendingCount === 1 ? 'is' : 'are'} ${pendingCount} pending booking(s) awaiting review.`,
            userIds: userIds,
            notifyAdmins: false
          });
        }
      } else {
        console.log('No pending bookings found for active events.');
      }
    } catch (error) {
      console.error('Error during pending booking check job:', error);
    }
  });
};

// Route Middleware
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/satsang', satsangRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/people', peopleRoutes);
app.use('/api/structure', structureRoutes);
app.use('/api/password-requests', passwordRequestRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/email', emailRoutes);

// Mount short link admin routes
const shortLinkRoutes = require('./routes/shortLinkRoutes');
app.use('/api/admin/short-links', shortLinkRoutes);

// --- SERVE FRONTEND (disabled on Vercel — handled by experimentalServices) ---
// app.use(express.static(path.join(__dirname, 'build')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

// --- SHORT LINK REDIRECT HANDLER ---
// Note: On Vercel single deployment the frontend handles routing,
// so this only catches /:slug requests that reach the backend service.
const { handleRedirect } = require('./controllers/shortLinkController');
app.get('/:slug', handleRedirect);

// Export app for Vercel serverless handler
module.exports = app;

// Start server only when running directly (not imported by Vercel)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}