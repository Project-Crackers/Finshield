const Income = require('../models/Income');
const User = require('../models/User');
const Notification = require('../models/Notification');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');


// @desc    Get all incomes for the logged-in user
// @route   GET /api/incomes
// @access  Private
const getIncomes = async (req, res) => {
  try {
    // Regular users can only see their own incomes
    const incomes = await Income.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    res.status(200).json(incomes);
  } catch (error) {
    console.error('Error fetching incomes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all incomes (admin/manager only)
// @route   GET /api/incomes/all
// @access  Private/Admin/Manager
const getAllIncomes = async (req, res) => {
  try {
    // Check if user is admin or manager
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      return res.status(403).json({ message: 'Not authorized to view all incomes' });
    }
    
    // Get all incomes with user details
    const incomes = await Income.find().sort({ createdAt: -1 });
    
    // Populate with user names
    const incomesWithUserNames = await Promise.all(
      incomes.map(async (income) => {
        const user = await User.findById(income.user);
        return {
          ...income._doc,
          userName: user ? user.name : 'Unknown User'
        };
      })
    );
    
    res.status(200).json(incomesWithUserNames);
  } catch (error) {
    console.error('Error fetching all incomes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get income by ID
// @route   GET /api/incomes/:id
// @access  Private
const getIncomeById = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    
    // Check if user is authorized to view this income
    if (income.user.toString() !== req.user.id && req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      return res.status(403).json({ message: 'Not authorized to view this income' });
    }
    
    res.status(200).json(income);
  } catch (error) {
    console.error('Error fetching income:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add new income
// @route   POST /api/incomes
// @access  Private
const addIncome = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { title, amount, category, description, receiptUrl } = req.body;
    
    // Create a hash for blockchain verification
    const timestamp = new Date().toISOString();
    const dataToHash = `${req.user.id}-${title}-${amount}-${timestamp}`;
    const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');
    
    console.log('Creating income with data:', {
      title,
      amount,
      category,
      description,
      receiptUrl,
      user: req.user.id,
      status: 'Pending',
      blockchainHash: hash
    });
    
    // Create new income
    const income = new Income({
      title,
      amount,
      category,
      description,
      receiptUrl,
      user: req.user.id,
      status: 'Pending',
      blockchainHash: hash
    });
    
    await income.save();
    console.log('Income saved successfully');
    
    // Create notification for managers/admins
    try {
      const adminsAndManagers = await User.find({
        role: { $in: ['Admin', 'Manager'] }
      });
      
      console.log(`Found ${adminsAndManagers.length} admins/managers for notifications`);
      
      for (const admin of adminsAndManagers) {
        await Notification.create({
          user: admin._id,
          title: 'New Income Added',
          message: `A new income of ₹${amount} has been added by ${req.user.name} and requires approval.`,
          type: 'income',
          relatedId: income._id,
          isRead: false
        });
      }
      console.log('Notifications created successfully');
    } catch (notificationError) {
      console.error('Error creating notifications:', notificationError);
      // Continue even if notification creation fails
    }
    
    res.status(201).json({
      message: 'Income added successfully and pending approval',
      income
    });
  } catch (error) {
    console.error('Error adding income:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update income status
// @route   PUT /api/incomes/:id/status
// @access  Private/Admin/Manager
const updateIncomeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Check if user is admin or manager
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      return res.status(403).json({ message: 'Not authorized to update income status' });
    }
    
    const income = await Income.findById(req.params.id);
    
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    
    console.log(`Updating income ${income._id} status to ${status}`);
    
    // Update status
    income.status = status;
    await income.save();
    
    console.log(`Income status updated successfully to ${status}`);
    
    try {
      // Create notification for the income owner
      await Notification.create({
        user: income.user,
        title: `Income ${status}`,
        message: `Your income of ₹${income.amount} has been ${status.toLowerCase()} by ${req.user.name}.`,
        type: 'income',
        relatedId: income._id,
        isRead: false
      });
      console.log('Notification created successfully');
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Continue even if notification creation fails
    }
    
    res.status(200).json({
      message: `Income ${status.toLowerCase()} successfully`,
      income
    });
  } catch (error) {
    console.error('Error updating income status:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Upload receipt image
// @route   POST /api/incomes/upload
// @access  Private
const uploadReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const receiptUrl = `/uploads/receipts/${req.file.filename}`;
    
    res.status(200).json({
      message: 'Receipt uploaded successfully',
      receiptUrl
    });
  } catch (error) {
    console.error('Error uploading receipt:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Export incomes as CSV
// @route   GET /api/incomes/export/csv
// @access  Private
const exportIncomesAsCSV = async (req, res) => {
  try {
    // Determine which incomes to export based on user role
    let incomes;
    
    if (req.user.role === 'Admin' || req.user.role === 'Manager') {
      incomes = await Income.find().sort({ createdAt: -1 });
    } else {
      incomes = await Income.find({ user: req.user.id }).sort({ createdAt: -1 });
    }
    
    // Format data for CSV
    const incomesData = incomes.map(income => ({
      Title: income.title,
      Amount: income.amount,
      Category: income.category,
      Description: income.description || 'N/A',
      Status: income.status,
      Date: new Date(income.createdAt).toLocaleDateString()
    }));
    
    // Generate CSV
    const fields = ['Title', 'Amount', 'Category', 'Description', 'Status', 'Date'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(incomesData);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=incomes.csv');
    
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting incomes as CSV:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Export incomes as PDF
// @route   GET /api/incomes/export/pdf
// @access  Private
const exportIncomesAsPDF = async (req, res) => {
  try {
    // Determine which incomes to export based on user role
    let incomes;
    
    if (req.user.role === 'Admin' || req.user.role === 'Manager') {
      incomes = await Income.find().sort({ createdAt: -1 });
    } else {
      incomes = await Income.find({ user: req.user.id }).sort({ createdAt: -1 });
    }
    
    // Create PDF document
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=incomes.pdf');
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Add title
    doc.fontSize(20).text('Income Report', { align: 'center' });
    doc.moveDown();
    
    // Add date
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);
    
    // Add table headers
    doc.fontSize(14).text('Income List', { underline: true });
    doc.moveDown();
    
    // Add incomes
    incomes.forEach((income, index) => {
      doc.fontSize(12).text(`${index + 1}. ${income.title}`);
      doc.fontSize(10).text(`Amount: ₹${income.amount}`);
      doc.fontSize(10).text(`Category: ${income.category}`);
      doc.fontSize(10).text(`Status: ${income.status}`);
      doc.fontSize(10).text(`Date: ${new Date(income.createdAt).toLocaleDateString()}`);
      doc.moveDown();
    });
    
    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Error exporting incomes as PDF:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getIncomes,
  getAllIncomes,
  getIncomeById,
  addIncome,
  updateIncomeStatus,
  uploadReceipt,
  exportIncomesAsCSV,
  exportIncomesAsPDF
};