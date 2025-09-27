const Room = require('../models/roomModel');
const Bed = require('../models/bedModel');
const Building = require('../models/buildingModel');
const Booking = require('../models/bookingModel');

// GET all rooms with populated details
exports.getRooms = async (req, res) => {
    try {
        const rooms = await Room.find().populate('beds').populate('buildingId', 'name');
        res.status(200).json(rooms || []);
    } catch (error) {
        console.error("Error fetching rooms:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// CREATE a new room and its beds in one transaction
exports.createRoom = async (req, res) => {
    const { roomNumber, buildingId, beds } = req.body;
    try {
        const building = await Building.findById(buildingId);
        if (!building) {
            return res.status(404).json({ message: 'Building not found' });
        }

        const newRoom = new Room({
            roomNumber,
            buildingId,
            eventId: building.eventId,
            beds: []
        });
        
        const bedDocs = beds.map(bedData => new Bed({
            roomId: newRoom._id,
            name: bedData.name,
            type: bedData.type
        }));
        
        const createdBeds = await Bed.insertMany(bedDocs);

        newRoom.beds = createdBeds.map(bed => bed._id);
        await newRoom.save();

        building.rooms.push(newRoom._id);
        await building.save();

        res.status(201).json({ message: 'Room and beds created successfully', room: newRoom });
    } catch (error) {
        console.error("Error creating room:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// UPDATE a room's details
exports.updateRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.status(200).json({ message: 'Room updated successfully', room });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// DELETE a room after checking for active bookings
exports.deleteRoom = async (req, res) => {
    const { id } = req.params;
    try {
        const roomToDelete = await Room.findById(id);
        if (!roomToDelete) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const activeBooking = await Booking.findOne({ 
            "allocations.roomId": id,
            status: { $in: ['pending', 'approved'] } 
        });

        if (activeBooking) {
            return res.status(409).json({ 
                message: 'This room cannot be deleted as it is part of an active booking.' 
            });
        }

        await Bed.deleteMany({ roomId: id });
        await Building.findByIdAndUpdate(roomToDelete.buildingId, { $pull: { rooms: id } });
        await Room.findByIdAndDelete(id);

        res.status(200).json({ message: 'Room and all its beds deleted successfully' });
    } catch (error) {
        console.error("Error deleting room:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};