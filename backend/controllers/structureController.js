const Building = require('../models/buildingModel');
const Person = require('../models/peopleModel');

// GET the entire facility structure and all people records
exports.getLiveStructure = async (req, res) => {
    try {
        const [buildings, people] = await Promise.all([
            Building.find()
                .populate({
                    path: 'rooms',
                    populate: {
                        path: 'beds'
                    }
                })
                .lean(), // Use .lean() for faster, plain JavaScript objects
            Person.find().lean()
        ]);

        res.status(200).json({ buildings, people });
    } catch (error) {
        console.error("Error fetching live structure data:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};