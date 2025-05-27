const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { generateHash } = require('../utils/blockchain');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { Parser } = require('json2csv');
const Notification = require('../models/Notification');
const { buildImmutableHashData } = require('../utils/buildImmutableHashData')
const puppeteer = require('puppeteer');


// Add this line to import asyncHandler
const asyncHandler = require('../middleware/asyncHandler');

// If you don't have an asyncHandler middleware, you can define it here:
// const asyncHandler = fn => (req, res, next) => 
//   Promise.resolve(fn(req, res, next)).catch(next);

let prevHash = "0000000000000000"; 

exports.getTransactions = async (req, res) => {
  try {
    const query = {};

    // Only filter by user if not admin/manager and not explicitly requesting all
    if (req.query.includeAll !== 'true' && req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      query.user = req.user.id;
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name email');  // Populate user details

    return res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ message: 'Error fetching transactions: ' + error.message });
  }
};


// Get transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('user', 'name email')
      .populate('comments.user', 'name');
      
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.status(200).json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.addTransaction = async (req, res) => {
  try {
    console.time('AddTransaction');
    
    const { description, amount, category, type } = req.body;
    console.log('Transaction type received:', type); // Add this line to debug
    const userId = req.user.id;

    console.time('FindLatestTransaction');
    const latestTransaction = await Transaction.findOne().sort({ createdAt: -1 });
    console.timeEnd('FindLatestTransaction');

    
    if (latestTransaction) {
      prevHash = latestTransaction.hash;
    }

    const createdAt = new Date();
    const billImageUrl = ''; // Must be consistent
    const status = 'pending'; // Must be consistent

    const dataToHash = buildImmutableHashData({
    description,
    amount,
    category,
    type: type || 'expense',
    billImageUrl,
    user: userId.toString(),        
    prevHash,
    createdAt: createdAt.toISOString(), 
  });
  console.log('Data to hash:', dataToHash);

    const hash = generateHash(dataToHash);

    const newTransaction = new Transaction({
      description,
      amount,
      category,
      type: type || 'expense',
      status,
      billImageUrl,
      user: userId,
      hash,
      prevHash,
      createdAt,
    });

    console.time('SaveTransaction');
    await newTransaction.save();
    console.log('AddTransaction data to hash:', dataToHash);
    console.log('AddTransaction generated hash:', hash);

    // Get the user's name for the notification message
    const user = await User.findById(userId);
    const userName = user ? user.name : 'An employee';

    // Create notification for the user who added the transaction
    const createdNot = await createNotification({
      user: userId,
      title: `${type === 'income' ? 'Income' : 'Expense'} Added`,
      message: `You added ${type === 'income' ? 'an income' : 'an expense'} of ₹${amount} for ${category}.`,
      read: false,
      createdAt: new Date(),
    });
    console.log('Notification:', createdNot);

    // Find all admin and manager users to notify them
    const adminAndManagerUsers = await User.find({
      role: { $in: ['Admin', 'Manager'] },
      _id: { $ne: userId } // Exclude the current user if they are an admin/manager
    });

    // Create notifications for all admin and manager users
    for (const adminUser of adminAndManagerUsers) {
      await createNotification({
        user: adminUser._id,
        title: `New ${type === 'income' ? 'Income' : 'Expense'} Added`,
        message: `${userName} has added ${type === 'income' ? 'an income' : 'an expense'} of ₹${amount} for ${category}.`,
        type: 'info',
        read: false,
        createdAt: new Date(),
      });
    }

    console.timeEnd('SaveTransaction');
    console.timeEnd('AddTransaction');

    res.status(201).json({
      message: 'Transaction added with secure blockchain hash!',
      transaction: newTransaction,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateTransactionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const transaction = await Transaction.findById(req.params.id).populate('user', 'name');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const userRole = req.user.role;

    if (userRole !== 'Admin' && userRole !== 'Manager') {
      return res.status(403).json({ message: 'Not authorized to approve/reject transactions' });
    }

    if (userRole === 'Manager' && transaction.user.toString() === req.user.id) {
      return res.status(403).json({ message: 'Managers cannot approve their own transactions' });
    }

    if (status === 'approved') {
      const blockchainStatus = await verifyBlockchainIntegrity(transaction);
      if (blockchainStatus === 'Tampered') {
        return res.status(400).json({ message: 'Cannot approve transaction with tampered blockchain record' });
      }
    }

    // Update only the mutable field
    transaction.status = status;
    transaction.actionBy = req.user.id;

    const dataToHash = buildImmutableHashData({
      description: transaction.description,
      amount: transaction.amount,
      category: transaction.category,
      type: transaction.type,
      billImageUrl: transaction.billImageUrl || '',
      user: transaction.user._id.toString(),
      prevHash: transaction.prevHash,
      createdAt: transaction.createdAt.toISOString()
    });
    console.log('UpdateTransaction data to hash:', dataToHash); 
    console.log('UpdateTransaction generated hash:', generateHash(dataToHash));
    console.log('UpdateTransaction hash string:', dataToHash);
    console.log('Stored hash:', transaction.hash);
    console.log('Recalculated hash:', generateHash(dataToHash));

    transaction.hash = generateHash(dataToHash);

    await transaction.save();

    // Get the name of the admin/manager who approved/rejected
    const actionUser = await User.findById(req.user.id);
    const actionUserName = actionUser ? actionUser.name : 'An admin';

    // Create a more detailed notification for the transaction owner
    await createNotification({
      user: transaction.user._id,
      title: `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your ${transaction.type} "${transaction.description}" of ₹${transaction.amount} has been ${status} by ${actionUserName}.`,
      type: status === 'approved' ? 'success' : 'error',
      reference: transaction._id
    });

    // Find all admin and manager users to notify them (except the one who performed the action)
    const adminAndManagerUsers = await User.find({
      role: { $in: ['Admin', 'Manager'] },
      _id: { $ne: req.user.id } // Exclude the current user who performed the action
    });

    // Get the name of the user whose transaction was approved/rejected
    const transactionOwnerName = transaction.user.name || 'An employee';

    // Create notifications for all admin and manager users
    for (const adminUser of adminAndManagerUsers) {
      await createNotification({
        user: adminUser._id,
        title: `Transaction ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `${actionUserName} has ${status} ${transactionOwnerName}'s ${transaction.type} of ₹${transaction.amount} for ${transaction.category}.`,
        type: status === 'approved' ? 'success' : 'error',
        read: false,
        reference: transaction._id
      });
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error('Error updating transaction status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const verifyBlockchainIntegrity = async () => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: 1 });

    if (transactions.length === 0) {
      return 'Secure'; // No transactions means no tampering
    }

    let expectedPrevHash = '0000000000000000'; // Match what you used in AddTransaction

    for (const tx of transactions) {
      const dataToHash = buildImmutableHashData({
        description: tx.description,
        amount: tx.amount,
        category: tx.category,
        type: tx.type,
        billImageUrl: tx.billImageUrl || '',
        user: tx.user.toString(),
        prevHash: expectedPrevHash,
        createdAt: tx.createdAt.toISOString(),
      });
      
      const recalculatedHash = generateHash(dataToHash);
      console.log('VerifyTransaction data to hash:', dataToHash);
      console.log('VerifyTransaction recalculated hash:', recalculatedHash);
      if (tx.hash !== recalculatedHash) {
        console.log('Hash mismatch in transaction:', tx._id);
        console.log('Stored hash:', tx.hash);
        console.log('Recalculated hash:', recalculatedHash);
        return 'Tampered';
      }

      expectedPrevHash = tx.hash;
    }

    return 'Secure';
  } catch (error) {
    console.error('Error verifying blockchain integrity:', error);
    return 'Unknown';
  }
};


// Get transaction statistics
exports.getTransactionStats = async (req, res) => {
  try {
    // Get total expenses amount
    const totalExpenses = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id), type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Get total income amount
    const totalIncome = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id), type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Get expenses by category
    const expensesByCategory = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id), type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);
    
    res.status(200).json({
      totalExpenses: totalExpenses.length > 0 ? totalExpenses[0].total : 0,
      totalIncome: totalIncome.length > 0 ? totalIncome[0].total : 0,
      balance: (totalIncome.length > 0 ? totalIncome[0].total : 0) - (totalExpenses.length > 0 ? totalExpenses[0].total : 0),
      expensesByCategory
    });
  } catch (error) {
    console.error('Error getting transaction stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get transactions by category
exports.getTransactionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    // Build query
    let query = { category };
    
    // If not admin or manager, filter by user
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      query.user = req.user.id;
    }
    
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 });
    
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions by category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get transactions by date range
exports.getTransactionsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    // Build query with date range
    let query = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    // If not admin or manager, filter by user
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      query.user = req.user.id;
    }
    
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 });
    
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions by date range:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Check if user is authorized to delete
    if (req.user.role !== 'Admin' && transaction.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this transaction' });
    }
    
    await Transaction.deleteOne({ _id: req.params.id });
    
    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.updateTransaction = async (req, res) => {
  try {
    const { description, amount, category, type } = req.body;
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (req.user.role !== 'Admin' && transaction.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this transaction' });
    }

    // Update mutable fields (that are also part of the hash)
    if (description) transaction.description = description;
    if (amount) transaction.amount = amount;
    if (category) transaction.category = category;
    if (type) transaction.type = type;

    // Recalculate hash since immutable fields changed
    const dataToHash = buildImmutableHashData({
      description: transaction.description,
      amount: transaction.amount,
      category: transaction.category,
      type: transaction.type,
      billImageUrl: transaction.billImageUrl || '',
      user: transaction.user.toString(),
      prevHash: transaction.prevHash,
      createdAt: transaction.createdAt
    });

    transaction.hash = generateHash(dataToHash);

    await transaction.save();

    res.status(200).json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Helper function to create notifications
const createNotification = async (notificationData) => {
  try {
    const notification = new Notification({
      user: notificationData.user,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'info',
      read: notificationData.read !== undefined ? notificationData.read : false,
      link: notificationData.link,
    });
    
    return await notification.save();
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Export the createNotification function
exports.createNotification = createNotification;

// Add the missing verifyTransactionBlockchain function
exports.verifyTransactionBlockchain = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    const blockchainStatus = await verifyBlockchainIntegrity(transaction);
    
    res.status(200).json({
      transactionId: transaction._id,
      status: blockchainStatus,
      message: blockchainStatus === 'Secure' 
        ? 'Transaction blockchain record is secure' 
        : 'Transaction blockchain record may have been tampered with'
    });
  } catch (error) {
    console.error('Error verifying transaction blockchain:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add the missing uploadBill function
exports.uploadBill = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const billImageUrl = `/uploads/bills/${req.file.filename}`;
    
    res.status(200).json({
      message: 'Bill uploaded successfully',
      billImageUrl
    });
  } catch (error) {
    console.error('Error uploading bill:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add the missing exportExpensesAsCSV function
exports.exportExpensesAsCSV = async (req, res) => {
  try {
    // Build query based on user role
    const query = { type: 'expense' };
    
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      query.user = req.user.id;
    }
    
    const expenses = await Transaction.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    if (expenses.length === 0) {
      return res.status(404).json({ message: 'No expenses found' });
    }
    
    // Transform data for CSV
    const expensesData = expenses.map(expense => ({
      ID: expense._id,
      Description: expense.description,
      Amount: expense.amount,
      Category: expense.category,
      Status: expense.status,
      Date: new Date(expense.createdAt).toLocaleDateString(),
      User: expense.user ? expense.user.name : 'Unknown',
      Email: expense.user ? expense.user.email : 'Unknown'
    }));
    
    // Define fields for CSV
    const fields = ['ID', 'Description', 'Amount', 'Category', 'Status', 'Date', 'User', 'Email'];
    
    // Create parser
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(expensesData);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
    
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting expenses as CSV:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add the missing exportExpensesAsPDF function
exports.exportExpensesAsPDF = async (req, res) => {
  try {
    // Build query based on user role
    const query = { type: 'expense' };
    
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      query.user = req.user.id;
    }
    
    const expenses = await Transaction.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    if (expenses.length === 0) {
      return res.status(404).json({ message: 'No expenses found' });
    }
    
    // Generate HTML for PDF
    let html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Expense Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <table>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Status</th>
              <th>Date</th>
              <th>User</th>
            </tr>
    `;
    
    expenses.forEach(expense => {
      html += `
        <tr>
          <td>${expense.description}</td>
          <td>₹${expense.amount}</td>
          <td>${expense.category}</td>
          <td>${expense.status}</td>
          <td>${new Date(expense.createdAt).toLocaleDateString()}</td>
          <td>${expense.user ? expense.user.name : 'Unknown'}</td>
        </tr>
      `;
    });
    
    html += `
          </table>
        </body>
      </html>
    `;
    
    // Launch puppeteer
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Set content and generate PDF
    await page.setContent(html);
    const pdf = await page.pdf({ format: 'A4' });
    
    await browser.close();
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=expenses.pdf');
    
    res.status(200).send(pdf);
  } catch (error) {
    console.error('Error exporting expenses as PDF:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add the missing addComment and getComments functions
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    const comment = {
      user: req.user.id,
      text,
      createdAt: new Date()
    };
    
    transaction.comments.push(comment);
    await transaction.save();
    
    // Populate the user information for the new comment
    const populatedTransaction = await Transaction.findById(req.params.id)
      .populate('comments.user', 'name');
    
    const newComment = populatedTransaction.comments[populatedTransaction.comments.length - 1];
    
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getComments = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('comments.user', 'name');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.status(200).json(transaction.comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// When fetching transactions, populate user information
const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find()
    .populate('user', 'name role') // Add role here
    .sort({ createdAt: -1 });
    
  // Transform data to include userName and userRole
  const transformedTransactions = transactions.map(transaction => {
    const transObj = transaction.toObject();
    if (transaction.user) {
      transObj.userName = transaction.user.name;
      transObj.userRole = transaction.user.role; // Add this line
    }
    return transObj;
  });
  
  res.status(200).json(transformedTransactions);
});