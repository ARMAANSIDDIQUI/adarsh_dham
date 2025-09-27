const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const roomController = require('../controllers/roomController');

// Admins and operators can get the list of all rooms
router.get(
    '/',
    authMiddleware,
    roleMiddleware(['admin', 'super-admin', 'operator', 'super-operator']),
    roomController.getRooms
);

// Only top-level admins can create new rooms
router.post(
    '/',
    authMiddleware,
    roleMiddleware(['admin', 'super-admin']),
    roomController.createRoom
);

// Only top-level admins can update a room
router.put(
    '/:id',
    authMiddleware,
    roleMiddleware(['admin', 'super-admin']),
    roomController.updateRoom
);

// Only top-level admins can delete a room
router.delete(
    '/:id',
    authMiddleware,
    roleMiddleware(['admin', 'super-admin']),
    roomController.deleteRoom
);

module.exports = router;