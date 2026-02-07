const Person = require('../models/peopleModel');

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
        stayTo: { $gt: start }
    };

    if (excludeBookingId) {
        query.bookingId = { $ne: excludeBookingId };
    }

    const existingOccupant = await Person.findOne(query);
    return !existingOccupant;
};

module.exports = {
    checkBedAvailability
};
