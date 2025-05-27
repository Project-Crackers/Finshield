import axios from '../../api/axios';

// Helper to get Authorization header with token
const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

// Get all notifications
const getNotifications = async () => {
  try {
    const response = await axios.get('/api/notifications', authHeader());
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mark notification as read
const markAsRead = async (notificationId) => {
  try {
    const response = await axios.put(`/api/notifications/${notificationId}`, {}, authHeader());
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mark all notifications as read
const markAllAsRead = async () => {
  try {
    const response = await axios.put('/api/notifications/read-all', {}, authHeader());
    return response.data;
  } catch (error) {
    throw error;
  }
};

const notificationService = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};

export default notificationService;
