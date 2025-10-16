const Building = require('../models/buildingModel');
const Room = require('../models/roomModel');
const Bed = require('../models/bedModel');
const Person = require('../models/peopleModel');

exports.getBuildings = async (req, res) => {
    try {
        const buildings = await Building.aggregate([
            {
                $lookup: {
                    from: 'rooms',
                    localField: 'rooms',
                    foreignField: '_id',
                    as: 'roomDetails'
                }
            },
            {
                $unwind: { path: "$roomDetails", preserveNullAndEmptyArrays: true } // Deconstruct the rooms array
            },
            {
                $lookup: {
                    from: 'beds',
                    localField: 'roomDetails.beds',
                    foreignField: '_id',
                    as: 'bedDetails'
                }
            },
            {
                $unwind: { path: "$bedDetails", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'people',
                    localField: 'bedDetails._id',
                    foreignField: 'bedId',
                    as: 'occupants'
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    gender: { $first: "$gender" },
                    rooms: { $addToSet: "$roomDetails._id" },
                    totalBeds: { $sum: { $cond: [{ $ifNull: ["$bedDetails._id", false] }, 1, 0] } },
                    totalOccupancy: { $sum: { $size: "$occupants" } }
                }
            },
            {
                $project: {
                    name: 1,
                    gender: 1,
                    roomCount: { $size: "$rooms" },
                    capacity: "$totalBeds",
                    occupancy: "$totalOccupancy"
                }
            }
        ]);

        res.status(200).json(buildings);
    } catch (error) {
        console.error("Error fetching buildings:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createBuilding = async (req, res) => {
    const { name, gender } = req.body; 
    try {
        const newBuilding = new Building({ name, gender }); 
        await newBuilding.save();
        res.status(201).json({ message: 'Building created successfully', building: newBuilding });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

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

exports.deleteBuilding = async (req, res) => {
    const { id } = req.params;
    try {
        const building = await Building.findById(id);
        if (!building) {
            return res.status(404).json({ message: 'Building not found' });
        }
        
        const roomsInBuilding = await Room.find({ buildingId: id });
        const roomIds = roomsInBuilding.map(r => r._id);
        const bedsInBuilding = await Bed.find({ roomId: { $in: roomIds } });
        const bedIds = bedsInBuilding.map(b => b._id);

        const assignedPerson = await Person.findOne({
            bedId: { $in: bedIds }
        });

        if (assignedPerson) {
            return res.status(409).json({ message: `Cannot delete building. It has occupants, including ${assignedPerson.name}.` });
        }
        
        await Bed.deleteMany({ roomId: { $in: roomIds } });
        await Room.deleteMany({ buildingId: id });
        await Building.findByIdAndDelete(id);
        
        res.status(200).json({ message: 'Building and all associated rooms/beds deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};