const User = require('../models/userModel');
const exceljs = require('exceljs');
const Booking = require('../models/bookingModel');
const bcrypt = require('bcrypt');

exports.getAdminDetails = async (req, res) => {
  try {
    const admins = await User.find({ roles: { $in: ['admin', 'super-admin', 'super-operator', 'operator', 'satsang-operator'] } });
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.toggleAdminRole = async (req, res) => {
  const { id } = req.params;
  const { role, hasRole } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (hasRole) {
      if (!user.roles.includes(role)) {
        user.roles.push(role);
      }
    } else {
      user.roles = user.roles.filter(r => r !== role);
    }
    await user.save();

    res.status(200).json({ message: 'Role updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.addAdmin = async (req, res) => {
  const { name, phone, password, roles } = req.body;
  
  if (!name || !phone || !password || !roles || roles.length === 0) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this phone number already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      phone,
      passwordHash,
      roles: [...roles, 'user']
    });

    await newUser.save();
    res.status(201).json({ message: 'Admin added successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.exportBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('userId').populate('eventId');
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Bookings');

    worksheet.columns = [
      { header: 'Booking ID', key: '_id', width: 30 },
      { header: 'User Name', key: 'userName', width: 30 },
      { header: 'User Phone', key: 'userPhone', width: 15 },
      { header: 'Event Name', key: 'eventName', width: 30 },
      { header: 'City', key: 'city', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 20 }
    ];

    bookings.forEach(booking => {
      worksheet.addRow({
        _id: booking._id,
        userName: booking.userId?.name,
        userPhone: booking.userId?.phone,
        eventName: booking.eventId?.name,
        city: booking.formData?.city,
        status: booking.status,
        createdAt: booking.createdAt?.toISOString()
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=bookings.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.changeAdminPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.updateAdminDetails = async (req, res) => {
  const { id } = req.params;
  const { name, phone } = req.body;

  try {
    const user = await User.findByIdAndUpdate(id, { name, phone }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User details updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.deleteAdmin = async (req, res) => {
  const { id } = req.params;
  
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};