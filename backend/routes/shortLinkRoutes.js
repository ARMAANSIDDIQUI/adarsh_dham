const express = require('express');
const router = express.Router();
const shortLinkController = require('../controllers/shortLinkController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Apply protection to all routes
router.use(authMiddleware);

// Allow admins and super-admins to manage links
// Using a broad role set for flexibility as per adminRoutes.js pattern
const adminRoles = ['admin', 'super-admin', 'operator', 'super-operator'];

router.post('/', roleMiddleware(adminRoles), shortLinkController.createShortLink);
router.get('/', roleMiddleware(adminRoles), shortLinkController.getAllShortLinks);
router.put('/:id', roleMiddleware(adminRoles), shortLinkController.updateShortLink);
router.delete('/:id', roleMiddleware(adminRoles), shortLinkController.deleteShortLink);

module.exports = router;
