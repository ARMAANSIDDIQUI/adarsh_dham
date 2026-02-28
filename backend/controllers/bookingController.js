const mongoose = require('mongoose');
const Booking = require('../models/bookingModel');
const Bed = require('../models/bedModel');
const Person = require('../models/peopleModel');
const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const Event = require('../models/eventModel');
const pdfGenerator = require('../utils/pdfGenerator');
const webpush = require('web-push');

// Import the updated helper
const { createAndSaveNotification } = require('../utils/notificationHelper');
const { checkBedAvailability } = require('../utils/bedUtils');

const generateBookingNumber = () => {
    const date = new Date();
    const dateString = date.getFullYear().toString().slice(-2)
        + ('0' + (date.getMonth() + 1)).slice(-2)
        + ('0' + date.getDate()).slice(-2);
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BK${dateString}-${randomChars}`;
};

// Helper for date validation
const validateDates = (formData, event) => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);

    // Calculate allowed range (+/- 5 days)
    const minDate = new Date(eventStart);
    minDate.setDate(minDate.getDate() - 5);
    const maxDate = new Date(eventEnd);
    maxDate.setDate(maxDate.getDate() + 5);

    // Normalize comparison (set time to midnight)
    const normalize = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const minTime = normalize(minDate);
    const maxTime = normalize(maxDate);

    const checkDate = (dateStr, label) => {
        if (!dateStr) return;
        const d = new Date(dateStr);
        const time = normalize(d);
        if (time < minTime || time > maxTime) {
            throw new Error(`${label} must be between ${minDate.toDateString()} and ${maxDate.toDateString()}`);
        }
    };

    if (formData.hasSameStayDuration) {
        checkDate(formData.stayFrom, 'Stay From date');
        checkDate(formData.stayTo, 'Stay To date');
    } else if (formData.people && Array.isArray(formData.people)) {
        formData.people.forEach((p, i) => {
            checkDate(p.stayFrom, `Person #${i + 1} Stay From date`);
            checkDate(p.stayTo, `Person #${i + 1} Stay To date`);
        });
    }
};

exports.createBooking = async (req, res) => {
    const { eventId, formData } = req.body;
    const userId = req.user.id;
    try {
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        try {
            validateDates(formData, event);
        } catch (validationError) {
            return res.status(400).json({ message: validationError.message });
        }

        const bookingNumber = generateBookingNumber();
        const newBooking = new Booking({ userId, eventId, formData, bookingNumber, status: 'pending' });
        await newBooking.save();

        // --- UPDATED HELPER CALL ---
        // Find all admins/super-admins
        const admins = await User.find({ roles: { $in: ['admin', 'super-admin'] } });
        await createAndSaveNotification({
            message: `A new booking request (#${bookingNumber}) has been submitted.`,
            userIds: admins.map(admin => admin._id.toString()), // Send to this specific list of users
            targetGroup: 'admin' // Label this notification as 'admin'
        });
        // --- END UPDATE ---

        res.status(201).json({ message: 'Booking request submitted successfully', booking: newBooking });
    } catch (error) {
        console.error("Error creating booking:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Failed to generate a unique booking number. Please try again.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.approveOrDeclineBooking = async (req, res) => {
    const { bookingId } = req.params;

    const { status, allocations: allocationData } = req.body;

    const {
        notificationOption,
        scheduledSendTime,
        notificationTtlMinutes,
        allocations
    } = allocationData || {};

    try {
        const booking = await Booking.findById(bookingId).populate('userId').populate('eventId');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const previousStatus = booking.status;
        let message = '';

        if (status !== 'approved') {
            await Person.deleteMany({ bookingId: booking._id });
        }

        if (status === 'approved') {
            await Person.deleteMany({ bookingId: booking._id });
            if (!allocations || !Array.isArray(allocations) || allocations.length !== booking.formData.people.length) {
                return res.status(400).json({ message: 'Allocation details must be provided as an array for every person.' });
            }

            // Helper to check if person is a young child (age < 4)
            const isYoungChild = (person) => {
                return (person.gender === 'boy' || person.gender === 'girl') &&
                    parseInt(person.age) < 4;
            };

            // Validate beds for non-children
            for (let i = 0; i < booking.formData.people.length; i++) {
                const personData = booking.formData.people[i];
                const allocation = allocations[i];

                // Young children (≤2) don't require bed allocation
                if (isYoungChild(personData)) {
                    continue; // Skip bed validation for young children
                }

                // For non-children, bed is required
                if (!allocation.bedId) {
                    return res.status(400).json({
                        message: `Bed allocation required for ${personData.name}.`
                    });
                }

                const isAvailable = await checkBedAvailability(
                    allocation.bedId,
                    personData.stayFrom || booking.formData.stayFrom,
                    personData.stayTo || booking.formData.stayTo,
                    booking._id
                );
                if (!isAvailable) {
                    return res.status(409).json({
                        message: `Bed ${allocation.bedId} is already occupied for the selected dates for ${personData.name}. Please re-allocate.`
                    });
                }
            }

            const peopleToCreate = booking.formData.people.map((personData, index) => {
                const allocation = allocations[index];
                const isChildPerson = isYoungChild(personData);
                return {
                    bookingId: booking._id,
                    bookingNumber: booking.bookingNumber,
                    userId: booking.userId._id,
                    eventId: booking.eventId._id,
                    bedId: isChildPerson ? null : allocation.bedId, // No bed for young children
                    isChild: isChildPerson,
                    name: personData.name,
                    age: personData.age,
                    gender: personData.gender,
                    stayFrom: personData.stayFrom || booking.formData.stayFrom,
                    stayTo: personData.stayTo || booking.formData.stayTo,
                    ashramName: booking.formData.ashramName,
                    contactNumber: booking.formData.contactNumber,
                    city: booking.formData.city,
                    baijiMahatmaJi: booking.formData.baijiMahatmaJi,
                };
            });
            await Person.insertMany(peopleToCreate);

            // Update allocations with isChild flag
            booking.allocations = allocations.map((alloc, index) => {
                const personData = booking.formData.people[index];
                const isChildPerson = isYoungChild(personData);
                return {
                    ...alloc,
                    isChild: isChildPerson,
                    bedId: isChildPerson ? null : alloc.bedId
                };
            });
            booking.status = 'approved';
            message = `Your booking for ${booking.eventId?.name} (#${booking.bookingNumber}) has been approved!`;

        } else {
            booking.status = status;
            booking.allocations = [];
            message = status === 'declined'
                ? `Unfortunately, your booking for ${booking.eventId?.name} (#${booking.bookingNumber}) has been declined.`
                : `Your booking for ${booking.eventId?.name} (#${booking.bookingNumber}) has been moved back to pending.`;
        }

        await booking.save();

        // --- UPDATED HELPER CALL ---
        if (booking.userId && previousStatus !== status && notificationOption && notificationOption !== 'dontSend') {
            const notificationPayload = {
                message,
                userIds: [booking.userId._id.toString()], // Send to this one specific user
                targetGroup: 'user' // Label it as a 'user' notification
            };

            if (notificationOption === 'schedule' && scheduledSendTime) {
                notificationPayload.sendAt = scheduledSendTime;
                if (notificationTtlMinutes) {
                    notificationPayload.ttlMinutes = parseInt(notificationTtlMinutes, 10);
                }
            }

            await createAndSaveNotification(notificationPayload);
        }
        // --- END UPDATE ---

        const updatedBooking = await Booking.findById(bookingId)
            .populate('userId', 'name')
            .populate('eventId', 'name')
            .populate('allocations.buildingId', 'name')
            .populate('allocations.roomId', 'roomNumber')
            .populate('allocations.bedId', 'name');

        res.status(200).json({ message: `Booking status successfully updated to ${status}.`, booking: updatedBooking });
    } catch (error) {
        console.error("Error updating booking status:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('userId', 'name')
            .populate('eventId', 'name startDate endDate bookingEndDate')
            .populate('allocations.buildingId', 'name')
            .populate('allocations.roomId', 'roomNumber capacity')
            .populate('allocations.bedId', 'name type capacity')
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        res.status(200).json(bookings || []);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id })
            .populate('eventId', 'name startDate endDate bookingEndDate')
            .populate('allocations.buildingId', 'name')
            .populate('allocations.roomId', 'roomNumber')
            .populate('allocations.bedId', 'name type')
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        res.status(200).json(bookings || []);
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateBooking = async (req, res) => {
    const { bookingId } = req.params;
    const { formData, showAllocationDetails } = req.body;
    try {
        const booking = await Booking.findById(bookingId).populate('eventId');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Allow if user is owner OR has admin privileges
        const isOwner = booking.userId.toString() === req.user.id;
        const isAdmin = req.user.roles && (req.user.roles.includes('admin') || req.user.roles.includes('super-admin'));

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized.' });
        }

        // --- GUARD: Non-admins cannot ADD members or change dates of an approved booking ---
        // We will validate shortly whether the user's edit is strictly reducing members.
        // For now, allow the process to proceed and we will apply the validation in the user edit block.

        // If only updating showAllocationDetails flag (admin toggle)
        if (showAllocationDetails !== undefined && !formData) {
            booking.showAllocationDetails = showAllocationDetails;
            await booking.save();
            return res.status(200).json({ message: 'Booking visibility updated.', booking });
        }

        const event = await Event.findById(booking.eventId);
        if (event) {
            try {
                validateDates(formData, event);
            } catch (validationError) {
                return res.status(400).json({ message: validationError.message });
            }
        }

        const oldPeople = booking.formData.people || [];
        const newPeople = formData.people || [];
        const wasApproved = booking.status === 'approved';

        // Helper to check if person is a young child (age < 4)
        const isYoungChild = (person) => {
            return (person.gender === 'boy' || person.gender === 'girl') &&
                parseInt(person.age) < 4;
        };

        // -------------------------------------------------------
        // ADMIN EDIT ON APPROVED BOOKING — keep status = 'approved'
        // -------------------------------------------------------
        if (wasApproved && isAdmin) {
            const currentAllocations = Array.isArray(booking.allocations) ? booking.allocations : [];

            // Determine removed people using robust _id mapping (not just popping from the end)
            const newPeopleIds = newPeople.map(p => p._id ? p._id.toString() : null).filter(Boolean);
            const removedOldIndices = [];
            const preservedAllocations = []; // Will store allocations matching the NEW people array

            oldPeople.forEach((op, index) => {
                const opId = op._id ? op._id.toString() : null;
                if (opId) {
                    if (!newPeopleIds.includes(opId)) removedOldIndices.push(index);
                } else {
                    // Fallback to name matching
                    const stillExists = newPeople.some(np => np.name === op.name);
                    if (!stillExists) removedOldIndices.push(index);
                }
            });

            // Delete Person records for removed people
            for (const removedIdx of removedOldIndices) {
                const removedAlloc = currentAllocations[removedIdx];
                if (!removedAlloc) continue;
                const removedPersonData = oldPeople[removedIdx];

                // Match by booking and either bedId OR name (if bed was null)
                await Person.findOneAndDelete({
                    bookingId: booking._id,
                    $or: [
                        { bedId: removedAlloc?.bedId || null },
                        { name: removedPersonData.name }
                    ]
                });
            }

            // Map old allocations to the newly structured people array
            for (let i = 0; i < newPeople.length; i++) {
                const np = newPeople[i];
                const npId = np._id ? np._id.toString() : null;

                // Find matching old person index
                let oldIdx = -1;
                if (npId) {
                    oldIdx = oldPeople.findIndex(op => op._id && op._id.toString() === npId);
                } else {
                    oldIdx = oldPeople.findIndex(op => op.name === np.name);
                }

                if (oldIdx !== -1 && currentAllocations[oldIdx]) {
                    preservedAllocations.push(currentAllocations[oldIdx]);
                } else {
                    // This is a NEW person added by the admin. Give them an empty allocation.
                    preservedAllocations.push({ bedId: null, roomId: null, buildingId: null });
                }
            }

            const newAllocations = preservedAllocations;

            // Validate beds for date changes on remaining people
            const unavailableBeds = [];
            for (let i = 0; i < newPeople.length; i++) {
                const personData = newPeople[i];
                const allocation = newAllocations[i];

                if (isYoungChild(personData) || !allocation?.bedId) continue;

                const newStayFrom = personData.stayFrom || formData.stayFrom;
                const newStayTo = personData.stayTo || formData.stayTo;

                const isAvailable = await checkBedAvailability(
                    allocation.bedId,
                    newStayFrom,
                    newStayTo,
                    booking._id
                );

                if (!isAvailable) {
                    unavailableBeds.push(personData.name);
                }
            }

            if (unavailableBeds.length > 0) {
                return res.status(409).json({
                    message: `Beds for ${unavailableBeds.join(', ')} are not available for the updated dates. Please adjust the dates or re-allocate via the allocations panel.`,
                    unavailableBeds
                });
            }

            // Update each remaining Person record
            for (let i = 0; i < newPeople.length; i++) {
                const personData = newPeople[i];
                const oldPersonData = oldPeople[i];
                const oldAlloc = currentAllocations[i];

                const newStayFrom = personData.stayFrom || formData.stayFrom;
                const newStayTo = personData.stayTo || formData.stayTo;

                // Match by booking and previous ID/Name anchor (if existed)
                const searchCriteria = { bookingId: booking._id };
                if (oldPersonData) {
                    searchCriteria.$or = [
                        { bedId: oldAlloc?.bedId || null },
                        { name: oldPersonData.name }
                    ];
                } else {
                    // Brand new person finding them by name if they somehow existed (they shouldn't)
                    searchCriteria.name = personData.name;
                }

                await Person.findOneAndUpdate(
                    searchCriteria,
                    {
                        $set: {
                            name: personData.name,
                            age: personData.age,
                            gender: personData.gender,
                            stayFrom: newStayFrom,
                            stayTo: newStayTo,
                            ashramName: formData.ashramName,
                            contactNumber: formData.contactNumber,
                            city: formData.city,
                            baijiMahatmaJi: formData.baijiMahatmaJi
                        },
                        $setOnInsert: {
                            bookingId: booking._id,
                            bookingNumber: booking.bookingNumber,
                            userId: booking.userId,
                            eventId: booking.eventId,
                            bedId: null,
                            isChild: isYoungChild(personData),
                            status: 'pending' // Still requires bed allocation technically
                        }
                    },
                    { upsert: true, new: true } // Upsert for new members added by Admin
                );
            }

            // Save updated formData + trimmed allocations
            booking.formData = formData;
            booking.allocations = newAllocations;
            await booking.save();

            const updatedBooking = await Booking.findById(bookingId)
                .populate('userId', 'name')
                .populate('eventId', 'name')
                .populate('allocations.buildingId', 'name')
                .populate('allocations.roomId', 'roomNumber')
                .populate('allocations.bedId', 'name');

            return res.status(200).json({
                message: 'Booking updated by admin. Occupancy records synchronized.',
                booking: updatedBooking,
                preservedAllocations: true
            });
        }

        // -------------------------------------------------------
        // USER EDIT ON PENDING/DECLINED BOOKING (or admin on non-approved)
        // -------------------------------------------------------

        // Check if member structure changed (count or gender/name changes requiring re-allocation)
        const newPeopleIds = newPeople.map(p => p._id ? p._id.toString() : null).filter(Boolean);
        let isReductionOrSame = true;
        let removedOldIndices = [];

        // STRICT NON-ADMIN APPROVED BOOKING VALIDATION
        if (wasApproved && !isAdmin) {
            if (newPeople.length >= oldPeople.length) {
                return res.status(400).json({ message: 'You can only remove members from an approved booking. To add members, please create a new booking.' });
            }

            // Ensure no new members were added (i.e. every new person must exist in old people)
            let addedNewMember = false;
            newPeople.forEach(np => {
                const npId = np._id ? np._id.toString() : null;
                let exists = false;
                if (npId) {
                    exists = oldPeople.some(op => op._id && op._id.toString() === npId);
                } else {
                    exists = oldPeople.some(op => op.name === np.name);
                }
                if (!exists) addedNewMember = true;
            });

            if (addedNewMember) {
                return res.status(400).json({ message: 'You cannot add new members to an approved booking.' });
            }

            // Force the rest of the formData to remain exactly the same
            formData.stayFrom = booking.formData.stayFrom;
            formData.stayTo = booking.formData.stayTo;
            formData.ashramName = booking.formData.ashramName;
            formData.email = booking.formData.email;
            formData.address = booking.formData.address;
            formData.city = booking.formData.city;
            formData.contactNumber = booking.formData.contactNumber;
            formData.fillingForOthers = booking.formData.fillingForOthers;
            formData.baijiMahatmaJi = booking.formData.baijiMahatmaJi;
            formData.baijiContact = booking.formData.baijiContact;
            formData.notes = booking.formData.notes;
            // We adjust the counts to match the new people array
            formData.numMales = newPeople.filter(p => p.gender === 'male').length;
            formData.numFemales = newPeople.filter(p => p.gender === 'female').length;
            formData.numBoys = newPeople.filter(p => p.gender === 'boy').length;
            formData.numGirls = newPeople.filter(p => p.gender === 'girl').length;

            // Ensure dates for each individual person are also not modified
            newPeople.forEach((np, i) => {
                const op = oldPeople.find(o => (np._id && o._id && np._id.toString() === o._id.toString()) || o.name === np.name);
                if (op) {
                    np.stayFrom = op.stayFrom;
                    np.stayTo = op.stayTo;
                }
            });
        }

        if (newPeople.length > oldPeople.length) {
            isReductionOrSame = false; // Cannot add members and keep it approved automatically
        } else {
            // Check if all NEW people existed in the OLD people list (meaning it's the same or a subset)
            oldPeople.forEach((op, index) => {
                const opId = op._id ? op._id.toString() : null;
                if (opId) {
                    if (!newPeopleIds.includes(opId)) removedOldIndices.push(index);
                } else {
                    const stillExists = newPeople.some(np => np.name === op.name);
                    if (!stillExists) removedOldIndices.push(index);
                }
            });

            // If the number of removed people plus the new people doesn't equal old people, 
            // it means they added someone completely new while removing someone else.
            if (newPeople.length + removedOldIndices.length !== oldPeople.length) {
                isReductionOrSame = false;
            }
        }

        if (wasApproved && isReductionOrSame && booking.allocations.length > 0) {
            // SMART EDIT: Dates changed or members removed, try to preserve allocations
            const currentAllocations = Array.isArray(booking.allocations) ? booking.allocations : [];
            const newAllocations = currentAllocations.filter((_, idx) => !removedOldIndices.includes(idx));

            let allBedsStillAvailable = true;
            const unavailableBeds = [];

            for (let i = 0; i < newPeople.length; i++) {
                const personData = newPeople[i];
                const allocation = newAllocations[i]; // Use newAllocations derived above

                if (isYoungChild(personData) || !allocation?.bedId) continue;

                const newStayFrom = personData.stayFrom || formData.stayFrom;
                const newStayTo = personData.stayTo || formData.stayTo;

                const isAvailable = await checkBedAvailability(
                    allocation.bedId,
                    newStayFrom,
                    newStayTo,
                    booking._id
                );

                if (!isAvailable) {
                    allBedsStillAvailable = false;
                    unavailableBeds.push(personData.name);
                }
            }

            if (allBedsStillAvailable) {
                // Determine removed people to delete their Person records
                for (const removedIdx of removedOldIndices) {
                    const removedAlloc = currentAllocations[removedIdx];
                    const removedPersonData = oldPeople[removedIdx];
                    await Person.findOneAndDelete({
                        bookingId: booking._id,
                        $or: [
                            { bedId: removedAlloc?.bedId || null },
                            { name: removedPersonData.name }
                        ]
                    });
                }

                for (let i = 0; i < newPeople.length; i++) {
                    const personData = newPeople[i];
                    const allocation = newAllocations[i];

                    const newStayFrom = personData.stayFrom || formData.stayFrom;
                    const newStayTo = personData.stayTo || formData.stayTo;

                    // Match by either bedId or Name (fallback for no-bed cases like young kids)
                    const searchCriteria = {
                        bookingId: booking._id,
                        $or: [
                            { bedId: allocation?.bedId || null },
                            { name: personData.name }
                        ]
                    };

                    await Person.findOneAndUpdate(
                        searchCriteria,
                        {
                            $set: {
                                age: personData.age,
                                stayFrom: newStayFrom,
                                stayTo: newStayTo,
                                ashramName: formData.ashramName,
                                contactNumber: formData.contactNumber,
                                city: formData.city,
                                baijiMahatmaJi: formData.baijiMahatmaJi
                            }
                        }
                    );
                }

                booking.formData = formData;
                booking.allocations = newAllocations;
                await booking.save();

                const updatedBooking = await Booking.findById(bookingId)
                    .populate('userId', 'name')
                    .populate('eventId', 'name')
                    .populate('allocations.buildingId', 'name')
                    .populate('allocations.roomId', 'roomNumber')
                    .populate('allocations.bedId', 'name');

                return res.status(200).json({
                    message: 'Booking updated successfully. Allocations preserved.',
                    booking: updatedBooking,
                    preservedAllocations: true
                });
            } else {
                await Person.deleteMany({ bookingId: booking._id });

                const updatedBooking = await Booking.findByIdAndUpdate(
                    bookingId,
                    { $set: { formData, status: 'pending', allocations: [] } },
                    { new: true, runValidators: true }
                );

                const admins = await User.find({ roles: { $in: ['admin', 'super-admin'] } });
                await createAndSaveNotification({
                    message: `Booking #${booking.bookingNumber} dates changed but beds are no longer available. Re-allocation required.`,
                    userIds: admins.map(admin => admin._id.toString()),
                    targetGroup: 'admin'
                });

                return res.status(200).json({
                    message: `Booking updated. Beds for ${unavailableBeds.join(', ')} not available for new dates. Re-allocation required.`,
                    booking: updatedBooking,
                    preservedAllocations: false,
                    unavailableBeds
                });
            }
        }

        // STANDARD EDIT: Member structure changed (added people) or booking wasn't approved
        if (wasApproved) {
            await Person.deleteMany({ bookingId: booking._id });
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { $set: { formData, status: 'pending', allocations: [] } },
            { new: true, runValidators: true }
        );

        const admins = await User.find({ roles: { $in: ['admin', 'super-admin'] } });
        let notificationMessage = `Booking #${booking.bookingNumber} was edited by the user and is now pending re-approval.`;
        if (isAdmin && !isOwner) {
            notificationMessage = `Booking #${booking.bookingNumber} was edited by an admin and is now pending re-approval.`;
        }

        await createAndSaveNotification({
            message: notificationMessage,
            userIds: admins.map(admin => admin._id.toString()),
            targetGroup: 'admin'
        });

        res.status(200).json({ message: 'Booking updated successfully. It is now pending re-approval.', booking: updatedBooking });
    } catch (error) {
        console.error("Error updating booking:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteMyBooking = async (req, res) => {
    const { bookingId } = req.params;
    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

        await Person.deleteMany({ bookingId: booking._id });
        await Booking.findByIdAndDelete(bookingId);

        // --- UPDATED HELPER CALL ---
        const admins = await User.find({ roles: { $in: ['admin', 'super-admin'] } });
        await createAndSaveNotification({
            message: `Booking #${booking.bookingNumber} was withdrawn by the user.`,
            userIds: admins.map(admin => admin._id.toString()),
            targetGroup: 'admin'
        });
        // --- END UPDATE ---

        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error("Error deleting booking:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.withdrawBooking = async (req, res) => {
    const { bookingId } = req.params;
    try {
        const booking = await Booking.findById(bookingId).populate('userId');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        await Person.deleteMany({ bookingId: booking._id });
        await Booking.findByIdAndDelete(bookingId);

        if (booking.userId) {
            const notificationMessage = `Your booking #${booking.bookingNumber} was withdrawn by an admin.`;
            await createAndSaveNotification({
                message: notificationMessage,
                userIds: [booking.userId._id.toString()],
                targetGroup: 'user'
            });
        }

        res.status(200).json({ message: 'Booking withdrawn successfully' });
    } catch (error) {
        console.error("Error withdrawing booking:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteBooking = async (req, res) => {
    const { bookingId } = req.params;
    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        await Person.deleteMany({ bookingId: booking._id });
        await Booking.findByIdAndDelete(bookingId);

        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error("Error deleting booking:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getBookingPdf = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('userId', 'name')
            .populate('eventId', 'name')
            .populate('allocations.buildingId', 'name')
            .populate('allocations.roomId', 'roomNumber')
            .populate('allocations.bedId', 'name type');

        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.status !== 'approved') return res.status(400).json({ message: 'A pass can only be generated for approved bookings.' });

        const bookingObject = booking.toObject();
        const pdfBuffer = await pdfGenerator.generateBookingPdf(bookingObject);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Booking-Pass-${booking.bookingNumber}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.getBookingById = async (req, res) => {
    const { bookingId } = req.params;
    try {
        const booking = await Booking.findById(bookingId)
            .populate('userId', 'name')
            .populate('eventId', 'name')
            .populate({
                path: 'allocations',
                populate: [
                    { path: 'buildingId', model: 'Building', select: 'name' },
                    { path: 'roomId', model: 'Room', select: 'roomNumber' },
                    { path: 'bedId', model: 'Bed', select: 'name' }
                ]
            });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getBookingsPaginated = async (req, res) => {
    try {
        const {
            page = 1, limit = 25, eventId = '', startDate = '',
            endDate = '', searchTerm = '', dateFilterType = 'stayRange'
        } = req.query;

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const filter = { status: 'approved' };
        if (eventId && mongoose.Types.ObjectId.isValid(eventId)) {
            filter.eventId = eventId;
        }

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1);

            if (dateFilterType === 'bookingDate') {
                filter.createdAt = { $gte: start, $lt: end };
            } else {
                filter['formData.stayFrom'] = { $lt: end };
                filter['formData.stayTo'] = { $gte: start };
            }
        }

        if (searchTerm) {
            filter.$or = [
                { bookingNumber: { $regex: searchTerm, $options: 'i' } },
                { 'formData.city': { $regex: searchTerm, $options: 'i' } },
            ];
        }

        const totalRecords = await Booking.countDocuments(filter);
        const bookings = await Booking.find(filter)
            .populate('eventId', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();

        return res.status(200).json({
            data: bookings,
            pagination: {
                totalRecords,
                totalPages: Math.ceil(totalRecords / limitNum),
                currentPage: pageNum,
                limit: limitNum
            }
        });
    } catch (error) {
        console.error("BOOKINGS PAGINATED CRASHED:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
