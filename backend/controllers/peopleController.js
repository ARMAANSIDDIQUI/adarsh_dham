const mongoose = require('mongoose');
const Person = require('../models/peopleModel');
const exceljs = require('exceljs');
const pdfGenerator = require('../utils/pdfGenerator');

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
            matchStage.gender = { $regex: new RegExp(`^${gender}$`, 'i') };
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

exports.exportPeopleCsv = async (req, res) => {
    try {
        const {
             eventId = '', buildingId = '', gender = '',
            startDate = '', endDate = '', searchTerm = '', sortBy = 'stayFrom',
            sortOrder = 'asc', dateFilterType = 'stayRange'
        } = req.query;

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
            matchStage.gender = { $regex: new RegExp(`^${gender}$`, 'i') };
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

        // Add sort
        pipeline.push({ $sort: sort });

        // Project necessary fields
        pipeline.push({
            $project: {
                _id: 1, name: 1, age: 1, gender: 1, bookingNumber: 1, stayFrom: 1,
                stayTo: 1, city: 1, contactNumber: 1,
                eventName: '$event.name',
                userName: '$user.name',
                userPhone: '$user.phone',
                buildingName: '$building.name',
                roomNumber: '$room.roomNumber',
                bedName: '$bed.name'
            }
        });

        const people = await Person.aggregate(pipeline);

        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('Occupancy Report');

        worksheet.columns = [
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Gender', key: 'gender', width: 10 },
            { header: 'Age', key: 'age', width: 10 },
            { header: 'City', key: 'city', width: 15 },
            { header: 'Contact', key: 'contactNumber', width: 15 },
            { header: 'Booking #', key: 'bookingNumber', width: 20 },
            { header: 'Event', key: 'eventName', width: 20 },
            { header: 'Stay From', key: 'stayFrom', width: 15 },
            { header: 'Stay To', key: 'stayTo', width: 15 },
            { header: 'Building', key: 'buildingName', width: 20 },
            { header: 'Room', key: 'roomNumber', width: 10 },
            { header: 'Bed', key: 'bedName', width: 10 },
            { header: 'Booked By', key: 'userName', width: 20 },
            { header: 'Booker Phone', key: 'userPhone', width: 15 },
        ];

        people.forEach(person => {
            worksheet.addRow({
                name: person.name,
                gender: person.gender,
                age: person.age,
                city: person.city,
                contactNumber: person.contactNumber,
                bookingNumber: person.bookingNumber,
                eventName: person.eventName,
                stayFrom: person.stayFrom ? new Date(person.stayFrom).toLocaleDateString() : '',
                stayTo: person.stayTo ? new Date(person.stayTo).toLocaleDateString() : '',
                buildingName: person.buildingName,
                roomNumber: person.roomNumber,
                bedName: person.bedName,
                userName: person.userName,
                userPhone: person.userPhone
            });
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=occupancy_report.csv');

        await workbook.csv.write(res);
        res.end();

    } catch (error) {
        console.error("Export People CSV Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.exportPeoplePdf = async (req, res) => {
    try {
        const {
             eventId = '', buildingId = '', gender = '',
            startDate = '', endDate = '', searchTerm = '', sortBy = 'stayFrom',
            sortOrder = 'asc', dateFilterType = 'stayRange'
        } = req.query;

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
            matchStage.gender = { $regex: new RegExp(`^${gender}$`, 'i') };
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

        // Add sort
        pipeline.push({ $sort: sort });

        // Project necessary fields
        pipeline.push({
            $project: {
                _id: 1, name: 1, age: 1, gender: 1, bookingNumber: 1, stayFrom: 1,
                stayTo: 1, city: 1, contactNumber: 1,
                eventName: '$event.name',
                userName: '$user.name',
                userPhone: '$user.phone',
                buildingName: '$building.name',
                roomNumber: '$room.roomNumber',
                bedName: '$bed.name'
            }
        });

        const people = await Person.aggregate(pipeline);

        // Generate PDF
        const pdfBuffer = await pdfGenerator.generateOccupancyReportPdf(people, {
            startDate, endDate, gender
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=occupancy_report.pdf');

        res.send(pdfBuffer);

    } catch (error) {
        console.error("Export People PDF Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};