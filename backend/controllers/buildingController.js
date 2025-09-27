const Building = require('../models/buildingModel');
const Room = require('../models/roomModel');
const Bed = require('../models/bedModel');
const Booking = require('../models/bookingModel');

// GET all buildings
exports.getBuildings = async (req, res) => {
    try {
        const buildings = await Building.find().populate('rooms');
        res.status(200).json(buildings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// CREATE a new building
// exports.createBuilding = async (req, res) => {
//     const { name, eventId, gender } = req.body;
//     try {
//         const newBuilding = new Building({ name, eventId, gender });
//         await newBuilding.save();
//         res.status(201).json({ message: 'Building created successfully', building: newBuilding });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// };

exports.createBuilding = async (req, res) => {
    const { name, gender } = req.body; 
    try {
        // Remove eventId from the new Building object
        const newBuilding = new Building({ name, gender }); 
        await newBuilding.save();
        res.status(201).json({ message: 'Building created successfully', building: newBuilding });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// UPDATE a building
// exports.updateBuilding = async (req, res) => {
//     try {
//         const building = await Building.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         if (!building) {
//             return res.status(404).json({ message: 'Building not found' });
//         }
//         res.status(200).json({ message: 'Building updated successfully', building });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// };


// UPDATE a building
exports.updateBuilding = async (req, res) => {
    const { name, gender } = req.body;
    try {
        const building = await Building.findByIdAndUpdate(req.params.id, { name, gender }, { new: true });
        if (!building) {
            return res.status(404).json({ message: 'Building not found' });
        }
        res.status(200).json({ message: 'Building updated successfully', building });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// DELETE a building
exports.deleteBuilding = async (req, res) => {
    const { id } = req.params;
    try {
        const building = await Building.findById(id);
        if (!building) {
            return res.status(404).json({ message: 'Building not found' });
        }
        
        // Check for active bookings in this building's rooms
        const activeBooking = await Booking.findOne({
            "allocations.buildingId": id,
            status: { $in: ['pending', 'approved'] }
        });

        if (activeBooking) {
            return res.status(409).json({ message: 'Cannot delete building with active bookings.' });
        }
        
        // Find all rooms in the building to delete their beds
        const rooms = await Room.find({ buildingId: id });
        for (const room of rooms) {
            await Bed.deleteMany({ roomId: room._id });
        }
        
        // Delete the rooms themselves, then the building
        await Room.deleteMany({ buildingId: id });
        await Building.findByIdAndDelete(id);
        
        res.status(200).json({ message: 'Building and all associated rooms/beds deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};