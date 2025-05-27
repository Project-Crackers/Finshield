import axios from './axios';

const getIncomes = async (isAdminOrManager = false) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.token) {
    throw new Error('No authentication token found');
  }

  const endpoint = isAdminOrManager ? '/api/incomes/all' : '/api/incomes';
  
  const response = await axios.get(endpoint, {
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  });
  
  return response.data;
};

const getIncomeById = async (id) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.token) {
    throw new Error('No authentication token found');
  }
  
  const response = await axios.get(`/api/incomes/${id}`, {
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  });
  
  return response.data;
};

const addIncome = async (incomeData) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.token) {
    throw new Error('No authentication token found');
  }
  
  const response = await axios.post('/api/incomes', incomeData, {
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  });
  
  return response.data;
};

const updateIncomeStatus = async (id, status) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.token) {
    throw new Error('No authentication token found');
  }
  
  const response = await axios.put(`/api/incomes/${id}/status`, { status }, {
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  });
  
  return response.data;
};

const uploadReceipt = async (formData) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.token) {
    throw new Error('No authentication token found');
  }
  
  const response = await axios.post('/api/incomes/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${user.token}`
    }
  });
  
  return response.data;
};

const exportIncomesAsCSV = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.token) {
    throw new Error('No authentication token found');
  }
  
  const response = await axios.get('/api/incomes/export/csv', {
    headers: {
      Authorization: `Bearer ${user.token}`
    },
    responseType: 'blob'
  });
  
  return response.data;
};

const incomeService = {
  getIncomes,
  getIncomeById,
  addIncome,
  updateIncomeStatus,
  uploadReceipt,
  exportIncomesAsCSV
};

export default incomeService;