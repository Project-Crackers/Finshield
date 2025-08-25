import axios from '../../api/axios';

// Create transaction
const createTransaction = async (transactionData) => {
  try {
    const response = await axios.post('/api/transactions', transactionData);
    return response.data;
  } catch (error) {
    console.error('Create transaction error:', error);
    throw error;
  }
};

// Get all transactions
const getTransactions = async () => {
  // Add a query parameter to request all transactions regardless of role
  const response = await axios.get('/api/transactions?includeAll=true');
  return response.data;
};

// Get transaction by ID
const getTransactionById = async (id) => {
  try {
    const response = await axios.get(`/api/transactions/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update transaction status
const updateTransactionStatus = async (id, status) => {
  try {
    const response = await axios.put(`/api/transactions/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get blockchain status
const getBlockchainStatus = async () => {
  try {
    const response = await axios.get('/api/blockchain/status', { timeout: 30000 }); 
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Upload bill image
const uploadBill = async (formData) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    const response = await axios.post('/api/transactions/upload-bill', formData, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export expenses as CSV
const exportExpensesAsCSV = async () => {
  try {
    const response = await axios.get('/api/transactions/export-csv', {
      responseType: 'blob'
    });
    
    // Create a download link and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return true;
  } catch (error) {
    console.error('Export CSV error:', error);
    throw error;
  }
};

// Export expenses as PDF
const exportExpensesAsPDF = async () => {
  try {
    const response = await axios.get('/api/transactions/export-pdf', {
      responseType: 'blob'
    });
    
    // Create a download link and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return true;
  } catch (error) {
    console.error('Export PDF error:', error);
    throw error;
  }
};

const transactionService = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransactionStatus,
  getBlockchainStatus,
  uploadBill,
  exportExpensesAsCSV,
  exportExpensesAsPDF
};
export default transactionService;