const Booking = require('../models/bookingModel');
const Bed = require('../models/bedModel');
const Notification = require('../models/notificationModel');
const Room = require('../models/roomModel');
const User = require('../models/userModel');
const pdfGenerator = require('../utils/pdfGenerator');

const generateBookingNumber = () => {
    const date = new Date();
    const dateString = date.getFullYear().toString().slice(-2) 
                     + ('0' + (date.getMonth() + 1)).slice(-2) 
                     + ('0' + date.getDate()).slice(-2);
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BK${dateString}-${randomChars}`;
};

exports.createBooking = async (req, res) => {
    const { eventId, formData } = req.body;
    const userId = req.user.id;
    try {
        const bookingNumber = generateBookingNumber();
        const newBooking = new Booking({ 
            userId, 
            eventId, 
            formData, 
            bookingNumber,
            status: 'pending' 
        });
        await newBooking.save();
        res.status(201).json({ message: 'Booking request submitted successfully', booking: newBooking });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Failed to generate a unique booking number. Please try again.' });
        }
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

exports.getBookingById = async (req, res) => {
    const { bookingId } = req.params;
    try {
        const booking = await Booking.findById(bookingId).populate('userId', 'name').populate('eventId', 'name');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.approveOrDeclineBooking = async (req, res) => {
    const { bookingId } = req.params;
    const { status, allocations } = req.body;
    try {
        const booking = await Booking.findById(bookingId).populate('userId').populate('eventId');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        let message = '';

        if (status === 'pending') {
            for (const alloc of booking.allocations) {
                if (alloc.bedId) {
                    await Bed.findByIdAndUpdate(alloc.bedId, { $inc: { occupancy: -1 } });
                }
            }
            booking.status = 'pending';
            booking.allocations = [];
            message = `Booking for ${booking.eventId?.name} is now pending again.`;
        } else if (status === 'approved') {
            if (!allocations || allocations.length === 0) return res.status(400).json({ message: 'Missing allocation details' });
            const bookingAllocationsToSave = [];
            for (const [index, alloc] of allocations.entries()) {
                const { bedId, roomId, buildingId } = alloc;
                if (!bedId) return res.status(400).json({ message: 'Missing bed ID in one or more allocations.' });
                const bed = await Bed.findById(bedId);
                if (!bed) return res.status(404).json({ message: `Bed with ID ${bedId} not found` });
                if (bed.occupancy >= bed.capacity) return res.status(400).json({ message: `Bed ${bed.name} is already full.` });
                await Bed.findByIdAndUpdate(bedId, { $inc: { occupancy: 1 } });
                bookingAllocationsToSave.push({ personIndex: index, buildingId, roomId, bedId });
            }
            booking.allocations = bookingAllocationsToSave;
            booking.status = 'approved';
            message = `Your booking for ${booking.eventId?.name} has been approved!`;
        } else if (status === 'declined') {
            booking.status = 'declined';
            booking.allocations = [];
            message = `Your booking for ${booking.eventId?.name} has been declined.`;
        } else {
            return res.status(400).json({ message: 'Invalid status provided' });
        }
        await booking.save();
        if (booking.userId) {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 7);
            await new Notification({
                message, userId: booking.userId._id, target: 'user', ttl: expiryDate
            }).save();
        }
        res.status(200).json({ message: 'Booking status updated successfully', booking });
    } catch (error) {
        console.error("Error approving or declining booking:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateBooking = async (req, res) => {
    const { bookingId } = req.params;
    const { formData } = req.body;
    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to edit this booking.' });
        }

        if (booking.status === 'approved') {
            for (const alloc of booking.allocations) {
                if (alloc.bedId) {
                    await Bed.findByIdAndUpdate(alloc.bedId, { $inc: { occupancy: -1 } });
                }
            }
            booking.allocations = [];
            
            const admins = await User.find({ roles: { $in: ['admin', 'super-admin'] } });
            const notificationMessage = `Booking #${booking.bookingNumber} was edited by the user and now requires re-approval.`;
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 7);

            for (const admin of admins) {
                await new Notification({
                    message: notificationMessage,
                    userId: admin._id,
                    target: 'admin',
                    ttl: expiryDate,
                }).save();
            }
        }

        booking.formData = formData;
        booking.status = 'pending';
        
        await booking.save();
        res.status(200).json({ message: 'Booking updated successfully. It is now pending re-approval.', booking });
    } catch (error) {
        console.error("Error updating booking:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteMyBooking = async (req, res) => {
    const { bookingId } = req.params;
    const userId = req.user.id;
    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.userId.toString() !== userId) return res.status(403).json({ message: 'Forbidden' });
        
        if (booking.status === 'approved' && booking.allocations.length > 0) {
            for(const alloc of booking.allocations) {
                if (alloc.bedId) {
                    await Bed.findByIdAndUpdate(alloc.bedId, { $inc: { occupancy: -1 } });
                }
            }
        }
        await Booking.findByIdAndDelete(bookingId);
        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getBookingPdf = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
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
        if (booking.status !== 'approved') {
            return res.status(400).json({ message: 'Booking must be approved to generate a pass.' });
        }
        
        const pdfBuffer = await pdfGenerator.generateBookingPdf(booking);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Booking-Pass-${booking.bookingNumber}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};