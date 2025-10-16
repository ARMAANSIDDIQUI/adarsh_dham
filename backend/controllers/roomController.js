// backend/controllers/roomController.js

const Room = require('../models/roomModel');
const Bed = require('../models/bedModel');
const Building = require('../models/buildingModel');
const Person = require('../models/peopleModel');

exports.getRooms = async (req, res) => {
    try {
        // We use an aggregation pipeline to calculate occupancy dynamically.
        const rooms = await Room.aggregate([
            {
                $lookup: {
                    from: 'beds',
                    localField: 'beds',
                    foreignField: '_id',
                    as: 'bedDetails'
                }
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
                $lookup: {
                    from: 'buildings',
                    localField: 'buildingId',
                    foreignField: '_id',
                    as: 'buildingInfo'
                }
            },
            {
                $project: {
                    roomNumber: 1,
                    buildingId: { $arrayElemAt: ["$buildingInfo", 0] }, // Get the building object
                    beds: "$bedDetails", // Keep the populated bed details
                    capacity: { $size: "$bedDetails" }, // Capacity is the total number of beds
                    occupancy: { $size: "$occupants" }, // Occupancy is the total number of people assigned
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);

        res.status(200).json(rooms || []);
    } catch (error) {
        console.error("Error fetching rooms:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// CREATE a new room and its beds
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

// DELETE a room after checking for assigned people
exports.deleteRoom = async (req, res) => {
    const { id } = req.params;
    try {
        const roomToDelete = await Room.findById(id).populate('beds');
        if (!roomToDelete) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const bedIdsInRoom = roomToDelete.beds.map(b => b._id);

        // NEW LOGIC: Check if any person is assigned to any bed in this room.
        const assignedPerson = await Person.findOne({ 
            bedId: { $in: bedIdsInRoom }
        });

        if (assignedPerson) {
            return res.status(409).json({ 
                message: `This room cannot be deleted as it has occupants. Please re-allocate people like ${assignedPerson.name} first.`
            });
        }

        // Proceed with deletion if no occupants are found
        await Bed.deleteMany({ roomId: id });
        await Building.findByIdAndUpdate(roomToDelete.buildingId, { $pull: { rooms: id } });
        await Room.findByIdAndDelete(id);

        res.status(200).json({ message: 'Room and all its beds deleted successfully' });
    } catch (error) {
        console.error("Error deleting room:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};