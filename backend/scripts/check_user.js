const mongoose = require('mongoose');
const User = require('../models/userModel');
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

const checkUser = async () => {
    await connectDB();
    const phone = '9999999999';
    try {
        const user = await User.findOne({ phone });
        if (user) {
            console.log('User Found:');
            console.log('ID:', user._id.toString());
            console.log('Name:', user.name);
            console.log('Phone:', user.phone);
            console.log('Email:', user.email);
            console.log('Roles:', user.roles);
        } else {
            console.log(`User with phone ${phone} NOT FOUND.`);
        }
    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
};

checkUser();
