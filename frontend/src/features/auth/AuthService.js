

import axios from '../../api/axios';

const API_URL = '/api/auth/';

// Register user
const register = async (userData) => {
  const response = await axios.post(API_URL + 'register', userData);
  
  if (response.data?.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }

  return response.data;
};

// Login user
const login = async (userData) => {
  try {
    // Optional: Clear old user first to avoid stale token issues
    localStorage.removeItem('user');

    const response = await axios.post(API_URL + 'login', userData);

    if (response.data?.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
  } catch (error) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Cannot connect to server. Please check if the backend is running.');
    }
    throw error;
  }
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');

  // Optional: also reload to reset Axios interceptor state
  window.location.href = '/login'; // or use `navigate('/login')` in React Router
};

const authService = {
  register,
  login,
  logout,
};

export default authService;
