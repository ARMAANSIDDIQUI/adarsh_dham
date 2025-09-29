// backend/routes/peopleRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const peopleController = require('../controllers/peopleController');

// GET all people (for admin/operator reports)
router.get(
    '/',
    authMiddleware,
    roleMiddleware(['admin', 'super-admin', 'operator', 'super-operator']),
    peopleController.getPeople
);

module.exports = router;