const mongoose = require('mongoose');
const Booking = require('../models/bookingModel');
const Bed = require('../models/bedModel');
const Person = require('../models/peopleModel');
const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const pdfGenerator = require('../utils/pdfGenerator');
const webpush = require('web-push');

// --- Centralized Helper Functions ---

const generateBookingNumber = () => {
    const date = new Date();
    const dateString = date.getFullYear().toString().slice(-2)
        + ('0' + (date.getMonth() + 1)).slice(-2)
        + ('0' + date.getDate()).slice(-2);
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BK${dateString}-${randomChars}`;
};

/**
 * Creates an in-app notification and sends an OS-level push notification if it is immediate.
 */
const createAndSaveNotification = async ({ message, userIds = [], notifyAdmins = false, sendAt, ttlMinutes = 10080 }) => {
    try {
        let targetUsers = [];

        if (notifyAdmins) {
            const admins = await User.find({ roles: { $in: ['admin', 'super-admin'] } });
            targetUsers.push(...admins);
        }
        
        if (userIds.length > 0) {
            const users = await User.find({ _id: { $in: userIds } });
            targetUsers.push(...users);
        }

        if (targetUsers.length === 0) return;

        const uniqueTargetUsers = [...new Map(targetUsers.map(user => [user._id.toString(), user])).values()];

        const sendDate = sendAt ? new Date(sendAt) : new Date();
        const ttlDate = new Date(sendDate.getTime() + ttlMinutes * 60 * 1000);
        const isScheduled = sendAt && sendDate > new Date();

        const notifications = [];
        const pushSubscriptions = [];

        for (const user of uniqueTargetUsers) {
            notifications.push({
                message,
                userId: user._id,
                target: notifyAdmins && !userIds.includes(user._id.toString()) ? 'admin' : 'user',
                ttl: ttlDate,
                sendAt: isScheduled ? sendDate : null,
                status: isScheduled ? 'scheduled' : 'sent',
            });

            if (!isScheduled && user.pushSubscription) {
                pushSubscriptions.push(user.pushSubscription);
            }
        }

        await Notification.insertMany(notifications);

        if (!isScheduled && pushSubscriptions.length > 0) {
            const payload = JSON.stringify({
                title: "Adarsh Dham: New Update",
                body: message,
            });

            const sendPromises = pushSubscriptions.map(sub => 
                webpush.sendNotification(sub, payload).catch(err => {
                    console.error(`Error sending push notification to a subscription: ${err.message}`);
                })
            );
            await Promise.all(sendPromises);
        }

        if (!isScheduled) {
            console.log(`(Simulating) Immediate notification created for ${uniqueTargetUsers.length} user(s).`);
        }
    } catch (error) {
        console.error("Failed to create and save notification:", error);
    }
};

// --- CRUD Functions ---

exports.createBooking = async (req, res) => {
    const { eventId, formData } = req.body;
    const userId = req.user.id;
    try {
        const bookingNumber = generateBookingNumber();
        const newBooking = new Booking({ userId, eventId, formData, bookingNumber, status: 'pending' });
        await newBooking.save();

        await createAndSaveNotification({
            message: `A new booking request (#${bookingNumber}) has been submitted.`,
            notifyAdmins: true
        });

        res.status(201).json({ message: 'Booking request submitted successfully', booking: newBooking });
    } catch (error) {
        console.error("Error creating booking:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Failed to generate a unique booking number. Please try again.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.approveOrDeclineBooking = async (req, res) => {
    const { bookingId } = req.params;
    
    const { status, allocations: allocationData } = req.body;
    
    // This is the one-line fix.
    // It safely handles cases where allocationData is null, preventing the server crash.
    const { notificationOption, scheduledSendTime, notificationTtlMinutes, allocations } = allocationData || {};

    try {
        const booking = await Booking.findById(bookingId).populate('userId').populate('eventId');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const previousStatus = booking.status;
        let message = '';
        
        await Person.deleteMany({ bookingId: booking._id });

        if (status === 'approved') {
            if (!allocations || !Array.isArray(allocations) || allocations.length !== booking.formData.people.length) {
                return res.status(400).json({ message: 'Allocation details must be provided as an array for every person.' });
            }

            const peopleToCreate = booking.formData.people.map((personData, index) => {
                const allocation = allocations[index];
                return {
                    bookingId: booking._id,
                    bookingNumber: booking.bookingNumber,
                    userId: booking.userId._id,
                    eventId: booking.eventId._id,
                    bedId: allocation.bedId,
                    name: personData.name,
                    age: personData.age,
                    gender: personData.gender,
                    stayFrom: booking.formData.stayFrom,
                    stayTo: booking.formData.stayTo,
                    ashramName: booking.formData.ashramName,
                    contactNumber: booking.formData.contactNumber,
                    city: booking.formData.city,
                    baijiMahatmaJi: booking.formData.baijiMahatmaJi,
                };
            });
            await Person.insertMany(peopleToCreate);

            booking.allocations = allocations;
            booking.status = 'approved';
            message = `Your booking for ${booking.eventId?.name} (#${booking.bookingNumber}) has been approved!`;

        } else {
            booking.status = status;
            booking.allocations = [];
            message = status === 'declined'
                ? `Unfortunately, your booking for ${booking.eventId?.name} (#${booking.bookingNumber}) has been declined.`
                : `Your booking for ${booking.eventId?.name} (#${booking.bookingNumber}) has been moved back to pending.`;
        }

        await booking.save();

        if (booking.userId && previousStatus !== status && notificationOption !== 'dontSend') {
            const notificationPayload = {
                message,
                userIds: [booking.userId._id.toString()],
            };
            
            if (notificationOption === 'schedule' && scheduledSendTime) {
                notificationPayload.sendAt = scheduledSendTime;
                if (notificationTtlMinutes) {
                    notificationPayload.ttlMinutes = parseInt(notificationTtlMinutes, 10);
                }
            }

            await createAndSaveNotification(notificationPayload);
        }

        const updatedBooking = await Booking.findById(bookingId)
            .populate('userId', 'name')
            .populate('eventId', 'name')
            .populate('allocations.buildingId', 'name')
            .populate('allocations.roomId', 'roomNumber')
            .populate('allocations.bedId', 'name');

        res.status(200).json({ message: `Booking status successfully updated to ${status}.`, booking: updatedBooking });
    } catch (error) {
        console.error("Error updating booking status:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('userId', 'name')
            .populate('eventId', 'name')
            .populate('allocations.buildingId', 'name')
            .populate('allocations.roomId', 'roomNumber capacity')
            .populate('allocations.bedId', 'name type capacity')
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        res.status(200).json(bookings || []);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id })
            .populate('eventId', 'name')
            .populate('allocations.buildingId', 'name')
            .populate('allocations.roomId', 'roomNumber')
            .populate('allocations.bedId', 'name type')
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        res.status(200).json(bookings || []);
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateBooking = async (req, res) => {
    const { bookingId } = req.params;
    const { formData } = req.body;
    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized.' });

        if (booking.status === 'approved') await Person.deleteMany({ bookingId: booking._id });

        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { $set: { formData, status: 'pending', allocations: [] } },
            { new: true, runValidators: true }
        );

        await createAndSaveNotification({
            message: `Booking #${booking.bookingNumber} was edited by the user and is now pending re-approval.`,
            notifyAdmins: true
        });

        res.status(200).json({ message: 'Booking updated successfully. It is now pending re-approval.', booking: updatedBooking });
    } catch (error) {
        console.error("Error updating booking:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteMyBooking = async (req, res) => {
    const { bookingId } = req.params;
    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

        await Person.deleteMany({ bookingId: booking._id });
        await Booking.findByIdAndDelete(bookingId);

        await createAndSaveNotification({
            message: `Booking #${booking.bookingNumber} was withdrawn by the user.`,
            notifyAdmins: true
        });

        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error("Error deleting booking:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getBookingPdf = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('userId', 'name')
            .populate('eventId', 'name')
            .populate('allocations.buildingId', 'name')
            .populate('allocations.roomId', 'roomNumber')
            .populate('allocations.bedId', 'name type');

        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.status !== 'approved') return res.status(400).json({ message: 'A pass can only be generated for approved bookings.' });

        const bookingObject = booking.toObject();
        const pdfBuffer = await pdfGenerator.generateBookingPdf(bookingObject);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Booking-Pass-${booking.bookingNumber}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getBookingById = async (req, res) => {
    const { bookingId } = req.params;
    try {
        const booking = await Booking.findById(bookingId)
            .populate('userId', 'name')
            .populate('eventId', 'name')
            .populate({
                path: 'allocations',
                populate: [
                    { path: 'buildingId', model: 'Building', select: 'name' },
                    { path: 'roomId', model: 'Room', select: 'roomNumber' },
                    { path: 'bedId', model: 'Bed', select: 'name' }
                ]
            });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.getBookingsPaginated = async (req, res) => {
    try {
        const {
            page = 1, limit = 25, eventId = '', startDate = '',
            endDate = '', searchTerm = '', dateFilterType = 'stayRange'
        } = req.query;

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const filter = { status: 'approved' };
        if (eventId && mongoose.Types.ObjectId.isValid(eventId)) {
            filter.eventId = eventId;
        }

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1);

            if (dateFilterType === 'bookingDate') {
                filter.createdAt = { $gte: start, $lt: end };
            } else {
                filter['formData.stayFrom'] = { $lt: end };
                filter['formData.stayTo'] = { $gte: start };
            }
        }

        if (searchTerm) {
            filter.$or = [
                { bookingNumber: { $regex: searchTerm, $options: 'i' } },
                { 'formData.city': { $regex: searchTerm, $options: 'i' } },
            ];
        }

        const totalRecords = await Booking.countDocuments(filter);
        const bookings = await Booking.find(filter)
            .populate('eventId', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();

        return res.status(200).json({
            data: bookings,
            pagination: {
                totalRecords,
                totalPages: Math.ceil(totalRecords / limitNum),
                currentPage: pageNum,
                limit: limitNum
            }
        });
    } catch (error) {
        console.error("BOOKINGS PAGINATED CRASHED:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
