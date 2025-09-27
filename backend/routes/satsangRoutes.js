const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const satsangController = require('../controllers/satsangController');

router.post(
  '/live-links',
  authMiddleware,
  roleMiddleware(['satsang-operator']),
  satsangController.createLiveLink
);
router.get(
  '/live-links',
  authMiddleware,
  roleMiddleware(['satsang-operator']),
  satsangController.getLiveLinks
);
router.get(
  '/live-links/event/:eventId',
  satsangController.getLinksByEvent
);
router.put(
  '/live-links/:id',
  authMiddleware,
  roleMiddleware(['satsang-operator']),
  satsangController.updateLiveLink
);
router.delete(
  '/live-links/:id',
  authMiddleware,
  roleMiddleware(['satsang-operator']),
  satsangController.deleteLiveLink
);

module.exports = router;