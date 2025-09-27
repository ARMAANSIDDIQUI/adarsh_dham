const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const buildingController = require('../controllers/buildingController');

// GET all buildings (for admins/operators)
router.get(
    '/',
    authMiddleware,
    roleMiddleware(['admin', 'super-admin', 'operator', 'super-operator']),
    buildingController.getBuildings
);

// POST a new building (admins only)
router.post(
    '/',
    authMiddleware,
    roleMiddleware(['admin', 'super-admin']),
    buildingController.createBuilding
);

// PUT to update a building (admins only)
router.put(
    '/:id',
    authMiddleware,
    roleMiddleware(['admin', 'super-admin']),
    buildingController.updateBuilding
);

// DELETE a building (admins only)
router.delete(
    '/:id',
    authMiddleware,
    roleMiddleware(['admin', 'super-admin']),
    buildingController.deleteBuilding
);

module.exports = router;