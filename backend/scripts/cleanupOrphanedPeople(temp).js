const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Person = require('../models/peopleModel');
const Booking = require('../models/bookingModel');

const cleanup = async () => {
    try {
        console.log('Connecting to MongoDB...');
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env file');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        console.log('Fetching all people...');
        const allPeople = await Person.find({});
        console.log(`Found ${allPeople.length} people records.`);

        // Filter out people who might have null/undefined bookingId (shouldn't happen with required: true, but good to be safe)
        const validPeople = allPeople.filter(p => p.bookingId);
        
        const bookingIds = [...new Set(validPeople.map(p => p.bookingId.toString()))];
        console.log(`Found ${bookingIds.length} unique booking IDs referenced in people records.`);

        console.log('Checking which bookings exist...');
        const existingBookings = await Booking.find({ _id: { $in: bookingIds } }).select('_id');
        const existingBookingIds = new Set(existingBookings.map(b => b._id.toString()));

        const orphanBookingIds = bookingIds.filter(id => !existingBookingIds.has(id));

        if (orphanBookingIds.length === 0) {
            console.log('No orphaned people records found. Data is consistent.');
        } else {
            console.log(`Found ${orphanBookingIds.length} booking IDs that no longer exist but have associated people.`);
            
            const deleteResult = await Person.deleteMany({ bookingId: { $in: orphanBookingIds } });
            console.log(`Deleted ${deleteResult.deletedCount} orphaned people records.`);
        }

    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
        process.exit();
    }
};

cleanup();
