const mongoose = require('mongoose');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel'); // Assuming bookings also have phone numbers
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

const fixPhoneNumbers = async () => {
    await connectDB();

    try {
        console.log('Starting phone number correction...');

        // 1. Fix Users
        const users = await User.find({});
        let userCount = 0;
        for (const user of users) {
            if (user.phone && user.phone.length > 10) {
                // Strip non-digits and take last 10
                let cleanPhone = user.phone.replace(/\D/g, '');
                if (cleanPhone.length > 10) {
                    cleanPhone = cleanPhone.slice(-10);
                }

                if (cleanPhone !== user.phone && cleanPhone.length === 10) {
                    // Check for collision
                    const collision = await User.findOne({ phone: cleanPhone });
                    if (collision && collision._id.toString() !== user._id.toString()) {
                        console.warn(`Skipping user ${user.name} (${user.phone}) -> ${cleanPhone} due to collision with user ${collision.name}`);
                        continue;
                    }

                    user.phone = cleanPhone;
                    await user.save();
                    userCount++;
                    console.log(`Updated user ${user.name}: ${cleanPhone}`);
                }
            }
        }
        console.log(`Processed ${users.length} users. Updated ${userCount} users.`);

        // 2. Fix Bookings (if they have phone numbers at root or inside formData)
        // Checking bookingModel structure might be needed, but assuming flat or formData
        const bookings = await Booking.find({});
        let bookingCount = 0;

        for (const booking of bookings) {
            let updated = false;

            // Check booking.phone or booking.contactNumber
            if (booking.phone && booking.phone.length > 10) {
                let clean = booking.phone.replace(/\D/g, '');
                if (clean.length > 10) clean = clean.slice(-10);
                if (clean.length === 10) {
                    booking.phone = clean;
                    updated = true;
                }
            }

            // Check internal formData if exists
            if (booking.formData && booking.formData.contactNumber) {
                const original = booking.formData.contactNumber;
                let clean = original.replace(/\D/g, '');
                if (clean.length > 10) clean = clean.slice(-10);

                if (clean.length === 10 && clean !== original) {
                    booking.formData.contactNumber = clean;
                    booking.markModified('formData');
                    updated = true;
                }
            }
            // Check internal formData baijiContact
            if (booking.formData && booking.formData.baijiContact) {
                const original = booking.formData.baijiContact;
                let clean = original.replace(/\D/g, '');
                if (clean.length > 10) clean = clean.slice(-10);

                if (clean.length === 10 && clean !== original) {
                    booking.formData.baijiContact = clean;
                    booking.markModified('formData');
                    updated = true;
                }
            }

            if (updated) {
                await booking.save();
                bookingCount++;
            }
        }
        console.log(`Processed ${bookings.length} bookings. Updated ${bookingCount} bookings.`);

    } catch (error) {
        console.error('Error fixing phone numbers:', error);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
};

fixPhoneNumbers();
