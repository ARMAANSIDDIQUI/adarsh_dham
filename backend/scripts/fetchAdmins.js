const mongoose = require('mongoose');
const User = require('../models/userModel');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const fetchAdmins = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MONGO_URI is not defined in .env file.");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    // Find users who have 'admin' OR 'super-admin' in their roles array
    const admins = await User.find({
        roles: { $in: ['admin', 'super-admin'] }
    });
    
    if (admins.length === 0) {
        console.log("No admins found.");
    } else {
        console.log(`Found ${admins.length} admins:`);
        admins.forEach(admin => {
            console.log("---------------------------------------------------");
            console.log(`ID: ${admin._id}`);
            console.log(`Name: ${admin.name}`);
            console.log(`Phone: ${admin.phone}`);
            console.log(`Roles: ${admin.roles.join(', ')}`);
        });
        console.log("---------------------------------------------------");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error fetching admins:", error);
    process.exit(1);
  }
};

fetchAdmins();
