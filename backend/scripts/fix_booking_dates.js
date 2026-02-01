const mongoose = require('mongoose');
const Booking = require('../models/bookingModel');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
console.log('Script started. mongo URI present?', !!process.env.MONGO_URI);

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

const fixBookingDates = async () => {
    await connectDB();

    try {
        console.log('Starting booking member date correction...');

        const bookings = await Booking.find({});
        let updatedCount = 0;

        for (const booking of bookings) {
            let needsSave = false;

            // Check if formData exists
            if (!booking.formData) continue;

            const { stayFrom, stayTo, people, hasSameStayDuration } = booking.formData;
            // Default to true if undefined, as legacy bookings likely imply same duration
            const isSameDuration = hasSameStayDuration !== false;

            if (people && Array.isArray(people) && people.length > 0) {
                booking.formData.people = people.map(person => {
                    let p = { ...person }; // Clone to avoid mutation issues if any
                    let personChanged = false;

                    // If same duration or dates missing, verify/fill them
                    if (isSameDuration) {
                        if (stayFrom && (!p.stayFrom || p.stayFrom !== stayFrom)) {
                            p.stayFrom = stayFrom;
                            personChanged = true;
                        }
                        if (stayTo && (!p.stayTo || p.stayTo !== stayTo)) {
                            p.stayTo = stayTo;
                            personChanged = true;
                        }
                    } else {
                        // If different durations allowed, ensure they at least have SOMETHING.
                        // If missing, fallback to main dates to prevent crashes.
                        if (!p.stayFrom && stayFrom) {
                            p.stayFrom = stayFrom;
                            personChanged = true;
                        }
                        if (!p.stayTo && stayTo) {
                            p.stayTo = stayTo;
                            personChanged = true;
                        }
                    }

                    if (personChanged) needsSave = true;
                    return p;
                });
            }

            // Also ensure hasSameStayDuration is explicitly set if missing
            if (booking.formData.hasSameStayDuration === undefined) {
                booking.formData.hasSameStayDuration = true;
                needsSave = true;
            }

            if (needsSave) {
                await Booking.updateOne({ _id: booking._id }, { $set: { formData: booking.formData } });
                updatedCount++;
                console.log(`Updated booking ${booking.bookingNumber || booking._id}`);
            }
        }

        console.log(`Processed ${bookings.length} bookings. Updated ${updatedCount} bookings.`);

    } catch (error) {
        console.error('Error fixing booking dates:', error);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
};

fixBookingDates();
