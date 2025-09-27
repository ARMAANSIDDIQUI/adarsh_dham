const Bed = require('../models/bedModel');
const Room = require('../models/roomModel');
const Booking = require('../models/bookingModel');

// CREATE a new bed and add it to a room
exports.createBed = async (req, res) => {
    const { roomId, name, type } = req.body;
    try {
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const newBed = new Bed({ roomId, name, type });
        await newBed.save();

        // Add the new bed's ID to the parent room's list of beds
        room.beds.push(newBed._id);
        await room.save();

        res.status(201).json({ message: 'Bed created and added to room successfully', bed: newBed });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET all beds
exports.getAllBeds = async (req, res) => {
    try {
        const beds = await Bed.find().populate({
            path: 'roomId',
            select: 'roomNumber'
        });
        res.status(200).json(beds);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET a single bed by ID
exports.getBedById = async (req, res) => {
    try {
        const bed = await Bed.findById(req.params.id).populate('roomId');
        if (!bed) {
            return res.status(404).json({ message: 'Bed not found' });
        }
        res.status(200).json(bed);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// UPDATE a bed
exports.updateBed = async (req, res) => {
    try {
        const bed = await Bed.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!bed) {
            return res.status(404).json({ message: 'Bed not found' });
        }
        res.status(200).json({ message: 'Bed updated successfully', bed });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// DELETE a bed
exports.deleteBed = async (req, res) => {
    const { id } = req.params;
    try {
        const bed = await Bed.findById(id);
        if (!bed) {
            return res.status(404).json({ message: 'Bed not found' });
        }

        const activeBooking = await Booking.findOne({
            "allocations.bedId": id,
            status: { $in: ['pending', 'approved'] }
        });

        if (activeBooking) {
            return res.status(409).json({
                message: 'This bed cannot be deleted as it is part of an active booking.'
            });
        }

        await Room.findByIdAndUpdate(bed.roomId, { $pull: { beds: id } });
        await Bed.findByIdAndDelete(id);

        res.status(200).json({ message: 'Bed deleted successfully' });
    } catch (error) {
        console.error("Error deleting bed:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};