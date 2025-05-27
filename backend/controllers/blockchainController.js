const Transaction = require('../models/Transaction');
const { generateHash } = require('../utils/blockchain');
const { buildImmutableHashData } = require('../utils/buildImmutableHashData');

exports.validateBlockchain = async (req, res) => {
  try {
    // Add populate to include user information
    const transactions = await Transaction.find()
      .sort({ createdAt: 1 })
      .populate('user', 'name email');
    
    let isValid = true;
    let issues = [];

    for (let i = 1; i < transactions.length; i++) {
      const prev = transactions[i - 1];
      const current = transactions[i];

      const dataToHash = buildImmutableHashData({
        description: current.description,
        amount: current.amount,
        category: current.category,
        type: current.type,
        billImageUrl: current.billImageUrl,
        user: current.user._id.toString(), // Use _id since user is now populated
        prevHash: prev.hash,
        createdAt: current.createdAt
      });

      const recalculatedHash = generateHash(dataToHash);

      if (current.prevHash !== prev.hash || current.hash !== recalculatedHash) {
        isValid = false;
        issues.push({
          transactionId: current._id,
          message: 'Chain broken or hash mismatch',
        });
      }
    }

    // Transform the response to include user names
    const transactionsWithUserNames = transactions.map(transaction => ({
      ...transaction._doc,
      createdBy: transaction.user ? transaction.user.name : 'Unknown User'
    }));

    res.status(200).json({
      status: isValid ? 'Secure ✅' : 'Tampered ❌',
      issues,
      transactions: transactionsWithUserNames
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};