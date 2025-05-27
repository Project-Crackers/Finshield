import axios from './axios';

const getUsers = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.token) {
    throw new Error('No authentication token found');
  }
  
  // Check if user is admin before making the request
  if (user.role !== 'Admin') {
    throw new Error('Only admin users can access user management');
  }
  
  const response = await axios.get('/api/users', {
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  });
  
  return response.data;
};

const getUserById = async (id) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.token) {
    throw new Error('No authentication token found');
  }
  
  const response = await axios.get(`/api/users/${id}`, {
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  });
  
  return response.data;
};

const updateUser = async (id, userData) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.token) {
    throw new Error('No authentication token found');
  }
  
  const response = await axios.put(`/api/users/${id}`, userData, {
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  });
  
  return response.data;
};

const deleteUser = async (id) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.token) {
    throw new Error('No authentication token found');
  }
  
  const response = await axios.delete(`/api/users/${id}`, {
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  });
  
  return response.data;
};

const userService = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};

export default userService;