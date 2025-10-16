const mongoose = require('mongoose');
const Bed = require('../models/bedModel');
const Room = require('../models/roomModel');
const Person = require('../models/peopleModel');

exports.getAllBeds = async (req, res) => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setDate(startOfToday.getDate() + 1);

        const beds = await Bed.aggregate([
            {
                $lookup: {
                    from: 'people',
                    let: { bed_id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$bedId', '$$bed_id'] },
                                        { $lt: ['$stayFrom', startOfTomorrow] },
                                        { $gte: ['$stayTo', startOfToday] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'currentOccupants'
                }
            },
            {
                $lookup: { from: 'rooms', localField: 'roomId', foreignField: '_id', as: 'roomInfo' }
            },
            { $unwind: { path: '$roomInfo', preserveNullAndEmptyArrays: true } },
            {
                $lookup: { from: 'buildings', localField: 'roomInfo.buildingId', foreignField: '_id', as: 'buildingInfo' }
            },
            { $unwind: { path: '$buildingInfo', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1, name: 1, type: 1, roomId: '$roomInfo._id',
                    roomNumber: '$roomInfo.roomNumber', buildingName: '$buildingInfo.name',
                    status: {
                        $cond: { if: { $gt: [{ $size: '$currentOccupants' }, 0] }, then: 'occupied', else: 'available' }
                    },
                    occupant: { $arrayElemAt: ['$currentOccupants', 0] }
                }
            }
        ]);

        res.status(200).json(beds);
    } catch (error) {
        console.error("Error fetching beds with status:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getBedById = async (req, res) => {
    try {
        const bedId = new mongoose.Types.ObjectId(req.params.id);
        
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setDate(startOfToday.getDate() + 1);

        const bedDetails = await Bed.aggregate([
            { $match: { _id: bedId } },
            { $limit: 1 },
            {
                $lookup: {
                    from: 'people',
                    let: { bed_id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$bedId', '$$bed_id'] },
                                        { $lt: ['$stayFrom', startOfTomorrow] },
                                        { $gte: ['$stayTo', startOfToday] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'currentOccupants'
                }
            },
            { $lookup: { from: 'rooms', localField: 'roomId', foreignField: '_id', as: 'roomInfo' } },
            { $unwind: { path: '$roomInfo', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'buildings', localField: 'roomInfo.buildingId', foreignField: '_id', as: 'buildingInfo' } },
            { $unwind: { path: '$buildingInfo', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1, name: 1, type: 1, roomId: '$roomInfo._id',
                    roomNumber: '$roomInfo.roomNumber', buildingName: '$buildingInfo.name',
                    status: {
                        $cond: { if: { $gt: [{ $size: '$currentOccupants' }, 0] }, then: 'occupied', else: 'available' }
                    },
                    occupant: { $arrayElemAt: ['$currentOccupants', 0] }
                }
            }
        ]);

        if (!bedDetails || bedDetails.length === 0) {
            return res.status(404).json({ message: 'Bed not found' });
        }

        res.status(200).json(bedDetails[0]);
    } catch (error) {
        console.error("Error fetching single bed with status:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createBed = async (req, res) => {
    const { roomId, name, type } = req.body;
    try {
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        const newBed = new Bed({ roomId, name, type });
        await newBed.save();
        room.beds.push(newBed._id);
        await room.save();
        res.status(201).json({ message: 'Bed created and added to room successfully', bed: newBed });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

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

exports.deleteBed = async (req, res) => {
    const { id } = req.params;
    try {
        const bed = await Bed.findById(id);
        if (!bed) {
            return res.status(404).json({ message: 'Bed not found' });
        }
        const assignedPerson = await Person.findOne({ bedId: id });
        if (assignedPerson) {
            return res.status(409).json({
                message: `This bed cannot be deleted as it is currently assigned to ${assignedPerson.name}. Please re-allocate them first.`
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