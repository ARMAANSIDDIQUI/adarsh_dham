const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const bedController = require('../controllers/bedController');

// POST /api/beds - Create a new bed
router.post(
    '/',
    authMiddleware,
    roleMiddleware(['admin', 'super-admin']),
    bedController.createBed
);

// GET /api/beds - Get a list of all beds
router.get(
    '/',
    authMiddleware,
    roleMiddleware(['admin', 'super-admin', 'operator', 'super-operator']),
    bedController.getAllBeds
);

// GET /api/beds/:id - Get a single bed by ID
router.get(
    '/:id',
    authMiddleware,
    roleMiddleware(['admin', 'super-admin', 'operator', 'super-operator']),
    bedController.getBedById
);

// PUT /api/beds/:id - Update a bed
router.put(
    '/:id',
    authMiddleware,
    roleMiddleware(['admin', 'super-admin']),
    bedController.updateBed
);

// DELETE /api/beds/:id - Delete a bed
router.delete(
    '/:id',
    authMiddleware,
    roleMiddleware(['admin', 'super-admin']),
    bedController.deleteBed
);

module.exports = router;