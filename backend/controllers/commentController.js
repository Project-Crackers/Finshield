const Comment = require('../models/Comment');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// @desc    Get comments for an expense
// @route   GET /api/comments/:expenseId
// @access  Private
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ expense: req.params.expenseId })
      .populate('user', 'name role')  // Add role to the populated fields
      .sort({ createdAt: -1 });
    
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add comment to an expense
// @route   POST /api/comments/:expenseId
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { expenseId } = req.params;
    
    if (!text) {
      return res.status(400).json({ message: 'Please provide comment text' });
    }
    
    // Verify the expense exists
    const expense = await Transaction.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    const comment = new Comment({
      text,
      expense: expenseId,
      user: req.user.id
    });
    
    await comment.save();
    
    // Populate user info before sending response
    const populatedComment = await Comment.findById(comment._id).populate('user', 'name');
    
    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getComments,
  addComment
};
