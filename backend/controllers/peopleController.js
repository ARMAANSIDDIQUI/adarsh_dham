const mongoose = require('mongoose');
const Person = require('../models/peopleModel');

// GET all people (your original function remains unchanged)
exports.getPeople = async (req, res) => {
    try {
        const { eventId } = req.query;
        const filter = {};

        if (eventId) filter.eventId = eventId;

        const people = await Person.find(filter)
            .populate({
                path: 'bedId',
                select: 'name',
                populate: {
                    path: 'roomId',
                    select: 'roomNumber',
                    populate: {
                        path: 'buildingId',
                        select: 'name'
                    }
                }
            })
            .populate('userId', 'name phone')
            .populate('eventId', 'name')
            .sort({ stayFrom: 1, name: 1 });

        res.status(200).json(people || []);
    } catch (error) {
        console.error("Error fetching people:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getPeoplePaginated = async (req, res) => {
    try {
        const {
            page = 1, limit = 25, eventId = '', buildingId = '', gender = '',
            startDate = '', endDate = '', searchTerm = '', sortBy = 'stayFrom',
            sortOrder = 'asc', dateFilterType = 'stayRange'
        } = req.query;

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const matchStage = {};
        
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1);

            if (dateFilterType === 'bookingDate') {
                matchStage.createdAt = { $gte: start, $lt: end };
            } else {
                matchStage.stayFrom = { $lt: end };
                matchStage.stayTo = { $gte: start };
            }
        }

        if (eventId && mongoose.Types.ObjectId.isValid(eventId)) {
            matchStage.eventId = new mongoose.Types.ObjectId(eventId);
        }

        if (gender) {
            matchStage.gender = gender;
        }

        let pipeline = [
            { $match: matchStage },
            { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
            { $lookup: { from: 'events', localField: 'eventId', foreignField: '_id', as: 'event' } },
            { $lookup: { from: 'beds', localField: 'bedId', foreignField: '_id', as: 'bed' } },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$event', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$bed', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'rooms', localField: 'bed.roomId', foreignField: '_id', as: 'room' } },
            { $unwind: { path: '$room', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'buildings', localField: 'room.buildingId', foreignField: '_id', as: 'building' } },
            { $unwind: { path: '$building', preserveNullAndEmptyArrays: true } },
        ];

        const secondMatchStage = {};
        if (buildingId && mongoose.Types.ObjectId.isValid(buildingId)) {
            secondMatchStage['building._id'] = new mongoose.Types.ObjectId(buildingId);
        }
        if (searchTerm) {
            secondMatchStage.$or = [
                { name: { $regex: searchTerm, $options: 'i' } },
                { bookingNumber: { $regex: searchTerm, $options: 'i' } },
                { city: { $regex: searchTerm, $options: 'i' } },
                { 'user.name': { $regex: searchTerm, $options: 'i' } },
                { 'building.name': { $regex: searchTerm, $options: 'i' } },
                { 'room.roomNumber': { $regex: searchTerm, $options: 'i' } },
                { 'bed.name': { $regex: searchTerm, $options: 'i' } },
            ];
        }
        if (Object.keys(secondMatchStage).length > 0) {
            pipeline.push({ $match: secondMatchStage });
        }

        pipeline.push({
            $facet: {
                metadata: [{ $count: 'totalRecords' }],
                data: [
                    { $sort: sort },
                    { $skip: skip },
                    { $limit: limitNum },
                    {
                        $project: {
                            _id: 1, name: 1, age: 1, gender: 1, bookingNumber: 1, bookingId: 1, stayFrom: 1,
                            stayTo: 1, city: 1,
                            eventId: '$event',
                            userId: '$user',
                            bedId: {
                                _id: '$bed._id', name: '$bed.name',
                                roomId: {
                                    _id: '$room._id', roomNumber: '$room.roomNumber',
                                    buildingId: '$building'
                                }
                            }
                        }
                    }
                ]
            }
        });
        
        const result = await Person.aggregate(pipeline);
        const data = result[0]?.data || [];
        const totalRecords = result[0]?.metadata[0]?.totalRecords || 0;
        
        res.status(200).json({
            data,
            pagination: { totalRecords, totalPages: Math.ceil(totalRecords / limitNum), currentPage: pageNum, limit: limitNum }
        });

    } catch (error) {
        console.error("PEOPLE CONTROLLER CRASHED:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};