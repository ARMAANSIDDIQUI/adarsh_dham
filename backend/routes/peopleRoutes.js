const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const peopleController = require('../controllers/peopleController');

router.get(
    '/',
    authMiddleware,
    roleMiddleware(['admin', 'super-admin', 'operator', 'super-operator']),
    peopleController.getPeople
);

router.get(
    '/paginated',
    authMiddleware,
    roleMiddleware(['admin', 'super-admin', 'operator', 'super-operator']),
    peopleController.getPeoplePaginated
);

router.get(
    '/export-csv',
    authMiddleware,
    roleMiddleware(['admin', 'super-admin', 'operator', 'super-operator']),
    peopleController.exportPeopleCsv
);

router.get(
    '/export-pdf',
    authMiddleware,
    roleMiddleware(['admin', 'super-admin', 'operator', 'super-operator']),
    peopleController.exportPeoplePdf
);

module.exports = router;