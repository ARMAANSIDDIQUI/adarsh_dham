// backend/controllers/peopleController.js

const Person = require('../models/peopleModel');

// GET all people, with optional filters for event, building, or room
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