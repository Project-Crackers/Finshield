/*import axios from 'axios';

// Create an axios instance with the base URL
const instance = axios.create({
  baseURL: 'http://localhost:5000', // backend base URL
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true // ✅ Required for sending credentials (cookies/tokens) across origins
});

// Add a request interceptor to include token in all requests
instance.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', error);
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    if (error.response && error.response.status === 500) {
      console.error('Server error details:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export default instance;
*/ 


import axios from 'axios';

// Create Axios instance
const instance = axios.create({
  baseURL: 'http://localhost:5000', // Backend base URL
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true, // Needed for sending cookies or credentials
});

// Request interceptor: Adds Authorization header
instance.interceptors.request.use(
  (config) => {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      }
    } catch (err) {
      console.warn('Failed to parse user from localStorage:', err);
    }
    return config;
  },
  (error) => {
    console.error('Axios request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor: Handles global errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn('Unauthorized – logging out');
      localStorage.removeItem('user');
      // Optionally, notify user or redirect
      window.location.href = '/login';
    }

    if (status === 404) {
      console.warn('API endpoint not found:', error.config?.url);
    }

    if (status === 500) {
      console.error('Internal server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default instance;
