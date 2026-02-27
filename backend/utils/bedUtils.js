const Person = require('../models/peopleModel');
const mongoose = require('mongoose');

/**
 * Checks if a bed is available for a given date range.
 * @param {string} bedId - The ID of the bed to check.
 * @param {Date|string} stayFrom - The starting date of the stay.
 * @param {Date|string} stayTo - The ending date of the stay.
 * @param {string} excludeBookingId - (Optional) A booking ID to ignore (e.g., when re-evaluating the same booking).
 * @returns {Promise<boolean>} - True if available, false if occupied.
 */
const checkBedAvailability = async (bedId, stayFrom, stayTo, excludeBookingId = null) => {
    const start = new Date(stayFrom);
    const end = new Date(stayTo);

    const query = {
        bedId,
        stayFrom: { $lt: end },
        $or: [
            { checkOutTime: null, stayTo: { $gt: start } },
            { checkOutTime: { $gt: start } }
        ]
    };

    if (excludeBookingId) {
        try {
            const objectId = typeof excludeBookingId === 'string'
                ? new mongoose.Types.ObjectId(excludeBookingId)
                : excludeBookingId;
            query.bookingId = { $ne: objectId };
        } catch (e) {
            console.error("Failed to cast excludeBookingId to ObjectId", e);
            query.bookingId = { $ne: excludeBookingId };
        }
    }

    // Temporarily logging to see why it fails
    const existingOccupant = await Person.findOne(query);

    // Fallback manual check to absolutely guarantee we never self-conflict
    if (existingOccupant && excludeBookingId && existingOccupant.bookingId.toString() === excludeBookingId.toString()) {
        console.warn('Mongoose $ne failed to exclude the current booking. Ignoring safely.', {
            foundId: existingOccupant.bookingId.toString(),
            expectedExcluded: excludeBookingId.toString()
        });

        // Try to find if there's any OTHER occupant
        const otherOccupant = await Person.findOne({ ...query, bookingId: { $ne: existingOccupant.bookingId } });
        return !otherOccupant;
    }

    return !existingOccupant;
};

module.exports = {
    checkBedAvailability
};
