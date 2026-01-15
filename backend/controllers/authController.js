const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { name, phone, password } = req.body;
  try {
    // Normalization logic for backward compatibility
    // If phone starts with +91, we also check if the number exists without it
    let query = { phone };
    if (phone.startsWith('+91')) {
        const phoneWithoutPrefix = phone.slice(3);
        query = { $or: [{ phone: phone }, { phone: phoneWithoutPrefix }] };
    } else {
        // Also check if the number provided without prefix exists with prefix in DB (unlikely for new reg but good safety)
        // Or if simple number provided, check if +91 version exists?
        // Let's stick to preventing duplicates: 
        // If incoming is +91999, check 999.
        // If incoming is 999 (legacy API usage?), check +91999.
        if (/^\d{10}$/.test(phone)) {
             query = { $or: [{ phone: phone }, { phone: '+91' + phone }] };
        }
    }

    const existingUser = await User.findOne(query);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this phone number already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      phone, // We save the full format provided by frontend
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
    // Normalization logic for backward compatibility
    let query = { phone };
    if (phone && phone.startsWith('+91')) {
        const phoneWithoutPrefix = phone.slice(3);
        query = { $or: [{ phone: phone }, { phone: phoneWithoutPrefix }] };
    } else if (phone && /^\d{10}$/.test(phone)) {
        // If user somehow sends raw 10 digit (legacy app), check for +91 version too
        query = { $or: [{ phone: phone }, { phone: '+91' + phone }] };
    }

    const user = await User.findOne(query);
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
      { expiresIn: '30d' } 
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
          bookings: user.bookings.filter(b => b.eventId)
      });

    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ message: 'Server error', error });
    }
};