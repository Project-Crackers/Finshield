/*
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const protect = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/bills'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed!'));
    }
  }
});

// Add new transaction
router.post('/', protect, transactionController.addTransaction);

// Update transaction status
router.put('/:id/status', protect, transactionController.updateTransactionStatus);

// Upload bill image
router.post('/upload-bill', protect, upload.single('billImage'), transactionController.uploadBill);

// Export transactions as CSV
router.get('/export-csv', protect, transactionController.exportExpensesAsCSV);

// Export transactions as PDF
router.get('/export-pdf', protect, transactionController.exportExpensesAsPDF);

// Get transaction statistics
router.get('/stats', protect, (req, res) => {
  res.status(200).json({ message: 'Statistics feature coming soon' });
});

// Get transactions by date range
router.get('/by-date', protect, transactionController.getTransactionsByDateRange);

// Get transactions by category
router.get('/by-category/:category', protect, transactionController.getTransactionsByCategory);

// Routes with :id param below static routes to prevent route conflicts
router.get('/:id/comments', protect, transactionController.getComments);

router.get('/:id/blockchain-verify', protect, transactionController.verifyTransactionBlockchain);

router.get('/:id', protect, transactionController.getTransactionById);

// Delete transaction (admin and owner only)
router.delete('/:id', protect, transactionController.deleteTransaction);

module.exports = router;
*/


const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const protect = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/bills'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed!'));
    }
  }
});

// Get all transactions
router.get('/', protect, transactionController.getTransactions);



// Add new transaction
router.post('/', protect, transactionController.addTransaction);

// Update transaction status
router.put('/:id/status', protect, transactionController.updateTransactionStatus);

// Upload bill image
router.post('/upload-bill', protect, upload.single('billImage'), transactionController.uploadBill);

// Add comment to transaction
router.post('/:id/comments', protect, transactionController.addComment);


// Export transactions as CSV
router.get('/export-csv', protect, transactionController.exportExpensesAsCSV);

// Export transactions as PDF
router.get('/export-pdf', protect, transactionController.exportExpensesAsPDF);

// Get transaction statistics
router.get('/stats', protect, (req, res) => {
  res.status(200).json({ message: 'Statistics feature coming soon' });
});
// Get transactions by date range
router.get('/by-date', protect, transactionController.getTransactionsByDateRange);

// Get transactions by category
router.get('/by-category/:category', protect, transactionController.getTransactionsByCategory);
// Get transaction by ID
router.get('/:id', protect, transactionController.getTransactionById);
// Get comments for a transaction
router.get('/:id/comments', protect, transactionController.getComments);
// Get blockchain verification for a transaction
router.get('/:id/blockchain-verify', protect, transactionController.verifyTransactionBlockchain);

// Delete transaction (admin and owner only)
router.delete('/:id', protect, transactionController.deleteTransaction);


module.exports = router;
