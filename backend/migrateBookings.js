const mongoose = require('mongoose');
require('dotenv').config();
const Booking = require('./models/bookingModel');

const migrateBookings = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const bookings = await Booking.find({});
        console.log(`Found ${bookings.length} total bookings. Checking for migrations...`);

        let updatedCount = 0;

        for (const booking of bookings) {
            let modified = false;

            // Ensure people array exists
            if (booking.formData && booking.formData.people) {
                // Check if hasSameStayDuration is missing, default to true
                if (booking.formData.hasSameStayDuration === undefined) {
                    booking.formData.hasSameStayDuration = true;
                    modified = true;
                }

                // Iterate through people and backfill missing stay dates
                booking.formData.people.forEach(person => {
                    if (!person.stayFrom || !person.stayTo) {
                        person.stayFrom = booking.formData.stayFrom;
                        person.stayTo = booking.formData.stayTo;
                        modified = true;
                    }
                });
            }

            if (modified) {
                await booking.save();
                updatedCount++;
                process.stdout.write(`.`); // Progress indicator
            }
        }

        console.log(`\nMigration complete. Updated ${updatedCount} bookings.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateBookings();
