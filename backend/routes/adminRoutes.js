const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const adminController = require('../controllers/adminController');

router.get(
  '/',
  authMiddleware,
  roleMiddleware(['super-admin']),
  adminController.getAdminDetails
);

router.post(
  '/toggle-role/:id',
  authMiddleware,
  roleMiddleware(['super-admin']),
  adminController.toggleAdminRole
);

router.post(
  '/add-admin',
  authMiddleware,
  roleMiddleware(['super-admin']),
  adminController.addAdmin
);

router.get(
  '/export-bookings',
  authMiddleware,
  roleMiddleware(['admin']),
  adminController.exportBookings
);

router.post(
  '/change-password/:id',
  authMiddleware,
  roleMiddleware(['super-admin']),
  adminController.changeAdminPassword
);

router.put(
  '/update-details/:id',
  authMiddleware,
  roleMiddleware(['super-admin']),
  adminController.updateAdminDetails
);

router.delete(
  '/delete-admin/:id',
  authMiddleware,
  roleMiddleware(['super-admin']),
  adminController.deleteAdmin
);

module.exports = router;