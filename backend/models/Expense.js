const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01
    },
    category: {
      type: String,
      required: true,
      enum: ['Office Supplies', 'Travel', 'Meals', 'Equipment', 'Software', 'Other']
    },
    description: {
      type: String,
      required: true
    },
    receiptUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    blockchainStatus: {
      type: String,
      enum: ['', 'Pending', 'Confirmed'],
      default: ''
    },
    blockchainTxHash: {
      type: String,
      default: ''
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;