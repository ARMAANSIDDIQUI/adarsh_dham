const mongoose = require('mongoose');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
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

const resetPassword = async () => {
    await connectDB();

    const targetPhone = '9999999999';
    const newPassword = '12345';

    try {
        console.log(`Searching for user with phone: ${targetPhone}`);
        const user = await User.findOne({ phone: targetPhone });

        if (!user) {
            console.error('User not found!');
            process.exit(1);
        }

        console.log(`User found: ${user.name}`);

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        user.passwordHash = passwordHash;
        await user.save();

        console.log(`Password for user ${targetPhone} has been reset to: ${newPassword}`);

    } catch (error) {
        console.error('Error resetting password:', error);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
};

resetPassword();
