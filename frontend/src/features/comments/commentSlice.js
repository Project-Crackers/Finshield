import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import commentService from './commentService';
import { toast } from 'react-toastify';

const initialState = {
  comments: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get comments for an expense
export const getComments = createAsyncThunk(
  'comments/getAll',
  async (expenseId, thunkAPI) => {
    try {
      return await commentService.getComments(expenseId);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add comment to an expense
export const addComment = createAsyncThunk(
  'comments/add',
  async ({ transactionId, content }, thunkAPI) => {
    try {
      // Fix: Pass the text property correctly to match backend expectations
      return await commentService.addComment(transactionId, { text: content });
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getComments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.comments = action.payload;
      })
      .addCase(getComments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(addComment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.comments.unshift(action.payload);
        toast.success('Comment added successfully');
      })
      .addCase(addComment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = commentSlice.actions;
export default commentSlice.reducer;