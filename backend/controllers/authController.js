const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const OTP = require('../models/otpModel');
const { sendEmail } = require('../utils/emailService');

exports.register = async (req, res) => {
  const { name, phone, password, email, otp } = req.body;
  try {
    // 1. Verify OTP first
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }
    const otpRecord = await OTP.findOne({ email, otp, type: 'register' });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // 2. Check if email is already taken
    const existingEmailUser = await User.findOne({ email });
    if (existingEmailUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Normalization logic for backward compatibility
    // If phone starts with +91, we also check if the number exists without it
    // Normalization logic: Enforce 10 digit number
    // Clean input just in case
    const cleanPhone = phone.replace(/\D/g, '').slice(-10); // Take last 10 digits
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }
    const query = { phone: cleanPhone };

    const existingUser = await User.findOne(query);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this phone number already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      phone,
      email,
      passwordHash,
      roles: ['user']
    });

    await newUser.save();

    // Cleanup OTP if not already consumed
    if (otpRecord) {
      await OTP.deleteOne({ _id: otpRecord._id });
    }

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp, type } = req.body;
  if (!email || !otp || !type) {
    return res.status(400).json({ message: 'Email, OTP, and type are required' });
  }

  try {
    const otpRecord = await OTP.findOne({ email, otp, type });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Rather than deleting the OTP here, we can set a verified flag on it, 
    // or just let the register step consume it.
    // For simplicity, we just return success so the frontend knows it's valid.

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

exports.login = async (req, res) => {
  const { phone, password } = req.body;
  try {
    // Normalization logic for backward compatibility
    // Normalization logic
    const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : '';
    console.log('Login Attempt:', { original: phone, clean: cleanPhone });

    if (!cleanPhone || cleanPhone.length !== 10) {
      console.log('Login Failed: Invalid Format');
      return res.status(400).json({ message: 'Invalid phone number format' });
    }
    const query = { phone: cleanPhone };

    const user = await User.findOne(query);
    if (!user) {
      console.log('Login Failed: User Not Found for', cleanPhone);
      return res.status(400).json({ message: 'Invalid phone or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      console.log('Login Failed: Password Mismatch');
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
        email: user.email,
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
        email: user.email,
        roles: user.roles
      },
      bookings: user.bookings.filter(b => b.eventId)
    });

  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.sendOtp = async (req, res) => {
  const { email, type } = req.body;
  if (!email || !type) {
    return res.status(400).json({ message: 'Email and type are required' });
  }

  try {
    // If registering, ensuring email doesn't exist
    if (type === 'register') {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }
    } else if (type === 'forgot_password') {
      // Ensure user exists for password reset
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return res.status(404).json({ message: 'No user found with this email' });
      }
    }

    // Rate Limiting: Check last OTP sent time (5 minute cooldown)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentOtp = await OTP.findOne({
      email,
      type,
      createdAt: { $gte: fiveMinutesAgo }
    }).sort({ createdAt: -1 });

    if (recentOtp) {
      const timeLeft = Math.ceil((recentOtp.createdAt.getTime() + 5 * 60 * 1000 - Date.now()) / 1000);
      const minutesLeft = Math.floor(timeLeft / 60);
      const secondsLeft = timeLeft % 60;
      return res.status(429).json({
        message: `Please wait ${minutesLeft}m ${secondsLeft}s before requesting another OTP.`
      });
    }

    // Rate Limiting: Check daily limit (5 OTPs per day)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dailyOtpCount = await OTP.countDocuments({
      email,
      type,
      createdAt: { $gte: oneDayAgo }
    });

    if (dailyOtpCount >= 5) {
      return res.status(429).json({
        message: 'Daily OTP limit reached (5 per day). Please try again tomorrow.'
      });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save new OTP (don't delete old ones to maintain rate limit tracking)
    await OTP.create({ email, otp, type });

    // Send Email
    const subject = `Your OTP for ${type === 'register' ? 'Registration' : type === 'forgot_password' ? 'Password Reset' : 'Profile Update'}`;
    const text = `Your OTP is ${otp}. It expires in 10 minutes.`;
    const html = `<p>Your OTP is <b>${otp}</b>.</p><p>It expires in 10 minutes.</p>`;

    await sendEmail(email, subject, text, html);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

exports.checkRecoveryMethod = async (req, res) => {
  const { phone } = req.body;
  try {
    const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : '';
    const query = { phone: cleanPhone };

    const user = await User.findOne(query);
    if (!user) {
      // Return generic response or 404. Let's return 404 to let frontend know user not found
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.email) {
      // Mask email
      const [local, domain] = user.email.split('@');
      const maskedLocal = local.length > 2 ? local[0] + '***' + local[local.length - 1] : local + '***';
      const maskedEmail = `${maskedLocal}@${domain}`;
      return res.status(200).json({ method: 'email', email: user.email, maskedEmail });
    } else {
      return res.status(200).json({ method: 'admin' });
    }

  } catch (error) {
    res.status(500).json({ message: 'Server error check recovery method' });
  }
};

exports.resetPasswordWithOtp = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const otpRecord = await OTP.findOne({ email, otp, type: 'forgot_password' });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    await OTP.deleteOne({ _id: otpRecord._id });
    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error resetting password' });
  }
};