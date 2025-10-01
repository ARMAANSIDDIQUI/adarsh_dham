const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const schedule = require('node-schedule');
const webpush = require('web-push'); // ✨ ADD THIS LINE
const structureRoutes = require('./routes/structureRoutes');
require('dotenv').config();

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

const User = require('./models/userModel');
const Event = require('./models/eventModel');
const Person = require('./models/peopleModel');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5000;

// ✨ ADD THIS BLOCK to configure web-push with your VAPID keys
webpush.setVapidDetails(
  'mailto:your-email@example.com', // Replace with your contact email
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    createFirstSuperAdmin();
    setupAllocationResetJob();
  })
  .catch(err => console.error('MongoDB connection error:', err));

const createFirstSuperAdmin = async () => {
  const superAdminPhone = process.env.SUPER_ADMIN_PHONE || '9999999999';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'superadminpassword';

  try {
    const existingSuperAdmin = await User.findOne({ phone: superAdminPhone });
    if (existingSuperAdmin) {
      console.log('✅ Super admin already exists. No new account was created.');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(superAdminPassword, salt);

    const newSuperAdmin = new User({
      name: 'Super Admin',
      phone: superAdminPhone,
      passwordHash,
      roles: ['user', 'super-admin', 'admin', 'super-operator', 'operator', 'satsang-operator']
    });

    await newSuperAdmin.save();
    console.log('✨ Initial Super Admin account created successfully.');
  } catch (error) {
    console.error('❌ Error creating initial Super Admin:', error);
  }
};

const setupAllocationResetJob = () => {
  // Runs every day at midnight
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

app.use('/api/auth', authRoutes);
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

app.get('/', (req, res) => {
  res.send('Adarsh Dham Backend is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});