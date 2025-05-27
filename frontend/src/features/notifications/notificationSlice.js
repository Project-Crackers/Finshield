import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from './notificationService';

const initialState = {
  notifications: [],
  unreadCount: 0,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get user notifications
export const getNotifications = createAsyncThunk(
  'notifications/getAll',
  async (_, thunkAPI) => {
    try {
      return await notificationService.getNotifications();
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Mark notification as read
export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, thunkAPI) => {
    try {
      return await notificationService.markAsRead(notificationId);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Mark all notifications as read
export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, thunkAPI) => {
    try {
      return await notificationService.markAllAsRead();
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create a notification
export const createNotification = createAsyncThunk(
  'notifications/create',
  async (notificationData, thunkAPI) => {
    try {
      return await notificationService.createNotification(notificationData);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Safely handle the response data
        const notifications = action.payload?.notifications || [];
        state.notifications = notifications;
        state.unreadCount = notifications.filter(n => !n.read).length || 0;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        // Safely handle the notification update
        if (action.payload?.notification) {
          state.notifications = state.notifications.map(notification =>
            notification._id === action.payload.notification._id
              ? { ...notification, read: true }
              : notification
          );
          state.unreadCount = state.notifications.filter(n => !n.read).length;
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(notification => ({
          ...notification,
          read: true
        }));
        state.unreadCount = 0;
      })
      .addCase(createNotification.fulfilled, (state, action) => {
        if (action.payload?.notification) {
          state.notifications.unshift(action.payload.notification);
          state.unreadCount += 1;
        }
      });
  },
});

export const { reset, addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;