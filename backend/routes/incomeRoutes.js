const express = require('express');
const router = express.Router();
const { getIncomes, getAllIncomes, getIncomeById, addIncome, updateIncomeStatus, uploadReceipt, exportIncomesAsCSV, exportIncomesAsPDF } = require('../controllers/incomeController');
const protect = require('../middleware/authMiddleware');
const { receipt } = require('../middleware/uploadMiddleware');

// Get all incomes for logged-in user
router.get('/', protect, getIncomes);

// Get all incomes (admin/manager only)
router.get('/all', protect, getAllIncomes);

// Get income by ID
router.get('/:id', protect, getIncomeById);

// Add new income
router.post('/', protect, addIncome);

// Update income status
router.put('/:id/status', protect, updateIncomeStatus);

// Upload receipt
router.post('/upload', protect, receipt.single('receiptImage'), uploadReceipt);

// Export incomes as CSV
router.get('/export/csv', protect, exportIncomesAsCSV);

// Export incomes as PDF
router.get('/export/pdf', protect, exportIncomesAsPDF);

module.exports = router;