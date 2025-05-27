
const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');

// ✅ Leave this test route for future sanity checks if you want
router.get('/test', (req, res) => {
  res.json({ message: 'Notification route works!' });
});

// ✅ Real routes
router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id', protect, markAsRead);

module.exports = router;
