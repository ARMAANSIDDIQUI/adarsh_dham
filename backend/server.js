const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const schedule = require('node-schedule');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const satsangRoutes = require('./routes/satsangRoutes');
const buildingRoutes = require('./routes/buildingRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bedRoutes = require('./routes/bedRoutes'); // <-- ADD THIS LINE

const User = require('./models/userModel');
const Event = require('./models/eventModel');
const Bed = require('./models/bedModel');
const Booking = require('./models/bookingModel');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5000;

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
  const superAdminPhone = '9999999999';
  const superAdminPassword = 'superadminpassword';

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
  schedule.scheduleJob('0 0 * * *', async () => {
    console.log('Running nightly allocation reset job...');
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    try {
      const completedEvents = await Event.find({ endDate: { $lte: twoDaysAgo } });

      for (const event of completedEvents) {
        const bookingsToReset = await Booking.find({ eventId: event._id, status: 'approved' });
        
        for (const booking of bookingsToReset) {
          if (booking.bedId) {
            await Bed.findByIdAndUpdate(booking.bedId, { status: 'available', allocatedTo: null });
            console.log(`Resetting bed ${booking.bedId} for event ${event.name}`);
          }
        }
      }
      console.log('Nightly allocation reset job completed.');
    } catch (error) {
      console.error('Error during allocation reset job:', error);
    }
  });
};

app.use('/api/auth', authRoutes);
app.use('/api/user', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/satsang', satsangRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/beds', bedRoutes); // <-- AND ADD THIS LINE

app.get('/', (req, res) => {
  res.send('Adarsh Dham Backend is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});