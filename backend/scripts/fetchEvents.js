const mongoose = require('mongoose');
const Event = require('../models/eventModel');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const fetchEvents = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MONGO_URI is not defined in .env file.");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    const events = await Event.find({});
    
    if (events.length === 0) {
        console.log("No events found.");
    } else {
        console.log(`Found ${events.length} events:`);
        events.forEach(event => {
            console.log("---------------------------------------------------");
            console.log(`ID: ${event._id}`);
            console.log(`Name: ${event.name}`);
            console.log(`Description: ${event.description}`);
            console.log(`Location: ${event.location || 'N/A'}`);
            console.log(`Dates: ${event.startDate ? event.startDate.toDateString() : 'N/A'} - ${event.endDate ? event.endDate.toDateString() : 'N/A'}`);
            console.log(`Booking Open: ${event.isBookingOpen}`);
        });
        console.log("---------------------------------------------------");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error fetching events:", error);
    process.exit(1);
  }
};

fetchEvents();
