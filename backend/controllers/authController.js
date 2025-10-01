const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { name, phone, password } = req.body;
  try {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this phone number already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      phone,
      passwordHash,
      roles: ['user']
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.login = async (req, res) => {
  const { phone, password } = req.body;
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: 'Invalid phone or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid phone or password' });
    }

    const token = jwt.sign(
      { id: user._id, roles: user.roles },
      process.env.JWT_SECRET,
      // ✨ FIX: Changed token expiration from 1 hour to 7 days
      { expiresIn: '7d' } 
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        roles: user.roles
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getMe = async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
          return res.status(401).json({ message: 'User not authenticated' });
      }

      const user = await User.findById(req.user.id)
          .populate({
              path: 'bookings',
              populate: { path: 'eventId' }
          })
          .exec();

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
          user: {
              id: user._id,
              name: user.name,
              phone: user.phone,
              roles: user.roles
          },
          bookings: user.bookings.filter(b => b.eventId) // Filter out bookings with missing events
      });

    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ message: 'Server error', error });
    }
};