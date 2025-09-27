const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['admin']),
  eventController.createEvent
);
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  eventController.updateEvent
);
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  eventController.deleteEvent
);

module.exports = router;