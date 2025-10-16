const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const bookingController = require('../controllers/bookingController');

// Any logged-in user can create a booking request
router.post(
    '/',
    authMiddleware,
    roleMiddleware(['user', 'admin', 'super-admin']),
    bookingController.createBooking
);

// Admins and operators can view all bookings for management
router.get(
    '/',
    authMiddleware,
    roleMiddleware(['admin', 'super-admin', 'operator', 'super-operator']),
    bookingController.getBookings
);

// A user can get their own bookings
router.get(
    '/my-bookings',
    authMiddleware,
    roleMiddleware(['user', 'admin', 'super-admin']),
    bookingController.getUserBookings
);

router.put(
    '/:bookingId/status',
    authMiddleware,
    roleMiddleware(['admin', 'super-admin', 'operator', 'super-operator']),
    bookingController.approveOrDeclineBooking
);

// A user can delete their own booking request
router.delete(
    '/delete/:bookingId',
    authMiddleware,
    roleMiddleware(['user', 'admin', 'super-admin']),
    bookingController.deleteMyBooking
);

router.get(
    '/:bookingId',
    authMiddleware,
    roleMiddleware(['admin', 'super-admin', 'operator', 'super-operator']),
    bookingController.getBookingById
);

router.put(
    '/update/:bookingId',
    authMiddleware,
    bookingController.updateBooking
);

router.get(
    '/pdf/:id',
    authMiddleware,
    bookingController.getBookingPdf
);

router.get(
    '/paginated',
    authMiddleware,
    roleMiddleware(['admin', 'super-admin', 'operator', 'super-operator']),
    bookingController.getBookingsPaginated
);

module.exports = router;