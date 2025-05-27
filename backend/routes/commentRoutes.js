const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getComments,
  addComment
} = require('../controllers/commentController');

// Get comments for an expense
router.get('/:expenseId', protect, getComments);

// Add comment to an expense
router.post('/:expenseId', protect, addComment);

module.exports = router;
