const mongoose = require('mongoose');
const { generateHash } = require('../utils/blockchain');

const transactionSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    default: 'expense',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  billImageUrl: {
    type: String,
    default: '',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  hash: {
    type: String,
    required: true,
  },
  prevHash: {
    type: String,
    required: true,
    default: '0000000000000000',
  },
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      content: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
}, { timestamps: true });

// Pre-save middleware to generate hash if not provided
transactionSchema.pre('save', function(next) {
  if (!this.isModified('hash') && !this.isNew) {
    return next();
  }
  
  // If hash is not provided, generate it
  if (!this.hash) {
    const dataToHash = `${this.description}-${this.amount}-${this.category}-${this.type}-${this.status}-${this.billImageUrl || ''}-${this.user}-${this.prevHash}-${Date.now()}`;
    this.hash = generateHash(dataToHash);
  }
  
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
