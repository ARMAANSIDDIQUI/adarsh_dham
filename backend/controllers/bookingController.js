const Booking = require('../models/bookingModel');
const Bed = require('../models/bedModel');
const Person = require('../models/peopleModel');
const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const pdfGenerator = require('../utils/pdfGenerator');

// --- Internal Helper Functions ---
const generateBookingNumber = () => {
    const date = new Date();
    const dateString = date.getFullYear().toString().slice(-2)
                         + ('0' + (date.getMonth() + 1)).slice(-2)
                         + ('0' + date.getDate()).slice(-2);
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BK${dateString}-${randomChars}`;
};

const sendUserNotification = async (userId, message) => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    const newNotification = new Notification({ message, userId, target: 'user', ttl: expiryDate });
    await newNotification.save();
};

const sendAdminNotification = async (message) => {
    const admins = await User.find({ roles: { $in: ['admin', 'super-admin'] } });
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    for (const admin of admins) {
        const newNotification = new Notification({ message, userId: admin._id, target: 'admin', ttl: expiryDate });
        await newNotification.save();
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
        await sendAdminNotification(`A new booking request (#${bookingNumber}) has been submitted.`);
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
    const { status, allocations } = req.body;

    try {
        const booking = await Booking.findById(bookingId).populate('userId').populate('eventId');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const previousStatus = booking.status;
        let message = '';

        await Person.deleteMany({ bookingId: booking._id });

        if (status === 'approved') {
            if (!allocations || allocations.length !== booking.formData.people.length) {
                return res.status(400).json({ message: 'Allocation details must be provided for every person in the booking.' });
            }

            const peopleToCreate = [];
            // CORRECTED: Create a new array to save with the correct personIndex
            const allocationsToSave = []; 

            for (const [index, personData] of booking.formData.people.entries()) {
                const allocation = allocations[index];
                if (!allocation || !allocation.bedId) {
                    return res.status(400).json({ message: `A bed allocation is missing for ${personData.name}.` });
                }
                
                // Add the personIndex to the allocation object before saving
                allocationsToSave.push({ ...allocation, personIndex: index });

                peopleToCreate.push({
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
                });
            }

            await Person.insertMany(peopleToCreate);
            
            // Save the corrected allocations array with the personIndex
            booking.allocations = allocationsToSave; 
            booking.status = 'approved';
            message = `Your booking for ${booking.eventId?.name} has been approved!`;

        } else {
            booking.status = status;
            booking.allocations = [];
            message = status === 'declined' 
                ? `Your booking for ${booking.eventId?.name} has been declined.` 
                : `Your booking for ${booking.eventId?.name} has been moved back to pending.`;
        }

        await booking.save();

        if (booking.userId && previousStatus !== status) {
            await sendUserNotification(booking.userId._id, message);
        }

        res.status(200).json({ message: `Booking status successfully updated to ${status}.`, booking });
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
            await Person.deleteMany({ bookingId: booking._id });
        }

        const updateData = {
            formData: formData,
            status: 'pending',
            allocations: []
        };
        
        const notificationMessage = `Booking #${booking.bookingNumber} was edited by the user and is now pending re-approval.`;
        await sendAdminNotification(notificationMessage);

        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedBooking) {
            return res.status(404).json({ message: 'Booking not found after update.' });
        }
        
        res.status(200).json({ message: 'Booking updated successfully. It is now pending re-approval.', booking: updatedBooking });
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
        
        await Person.deleteMany({ bookingId: booking._id });
        
        const notificationMessage = `Booking #${booking.bookingNumber} was withdrawn by the user. Its previous status was '${booking.status}'.`;
        await sendAdminNotification(notificationMessage);

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
        
        // CORRECTED: Convert the Mongoose document to a plain JavaScript object
        const bookingObject = booking.toObject();

        // Pass the plain object to the generator
        const pdfBuffer = await pdfGenerator.generateBookingPdf(bookingObject);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Booking-Pass-${booking.bookingNumber}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};