const mongoose = require('mongoose');
const User = require('../models/userModel');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const migratePhoneNumbers = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MONGO_URI is not defined in .env file.");
      process.exit(1);
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB.");

    const defaultCode = process.env.DEFAULT_COUNTRY_CODE || '+91';
    console.log(`Using default country code: ${defaultCode}`);

    const users = await User.find({});
    console.log(`Found ${users.length} users. Checking for updates...`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        if (user.phone && !user.phone.startsWith('+')) {
            // Assume if it doesn't start with +, it's a raw number and needs the prefix
            // Also basic check if it looks like a 10 digit number (or whatever length)
            // We'll just prepend the code if missing
            const oldPhone = user.phone;
            user.phone = defaultCode + user.phone;
            await user.save();
            console.log(`Updated user ${user.name}: ${oldPhone} -> ${user.phone}`);
            updatedCount++;
        } else {
            skippedCount++;
        }
      } catch (err) {
        console.error(`Failed to update user ${user._id} (${user.name}):`, err.message);
        errorCount++;
      }
    }

    console.log(`Migration complete.`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped (already formatted): ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migratePhoneNumbers();
