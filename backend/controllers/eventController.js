const Event = require('../models/eventModel');
const Booking = require('../models/bookingModel');
const Notification = require('../models/notificationModel');
const Person = require('../models/peopleModel');

exports.createEvent = async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json({ message: 'Event updated successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


exports.deleteEvent = async (req, res) => {
  const { id } = req.params;
  
  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const bookings = await Booking.find({ eventId: id });

    if (bookings.length > 0) {
      const bookingIds = bookings.map(b => b._id);
      await Person.deleteMany({ bookingId: { $in: bookingIds } });

      const userIds = bookings.map(b => b.userId);
      
      const notifications = userIds.map(userId => ({
        message: `Your booking for the event "${event.name}" has been cancelled as the event has been cancelled.`,
        userId: userId,
        target: 'user',
        ttl: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day TTL
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }

      await Booking.deleteMany({ eventId: id });
    }

    await Event.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Event and associated bookings and people deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.checkEventBookings = async (req, res) => {
  const { id } = req.params;
  try {
    const bookings = await Booking.find({ eventId: id, status: { $in: ['pending', 'approved'] } });
    res.status(200).json({ exists: bookings.length > 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
