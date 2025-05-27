import axios from '../../api/axios';

// Get token from local storage
const getToken = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token;
};

// Get comments for an expense
const getComments = async (expenseId) => {
  try {
    const token = getToken();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    
    const response = await axios.get(`/api/comments/${expenseId}`, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add comment to an expense
const addComment = async (expenseId, commentData) => {
  try {
    const token = getToken();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    
    const response = await axios.post(`/api/comments/${expenseId}`, commentData, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const commentService = {
  getComments,
  addComment
};

export default commentService;