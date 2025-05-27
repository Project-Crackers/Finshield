import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import transactionService from './TransactionService';
import { toast } from 'react-toastify';
import axios from '../../api/axios';

// Get all transactions
export const getTransactions = createAsyncThunk(
  'transactions/getAll',
  async (_, thunkAPI) => {
    try {
      return await transactionService.getTransactions();
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create new transaction
export const createTransaction = createAsyncThunk(
  'transactions/create',
  async (transactionData, thunkAPI) => {
    try {
      const response = await transactionService.createTransaction(transactionData);
      toast.success('Transaction created successfully');
      return response;
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get blockchain status
export const getBlockchainStatus = createAsyncThunk(
  'transactions/blockchainStatus',
  async (_, thunkAPI) => {
    try {
      return await transactionService.getBlockchainStatus();
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add this to your existing transactionSlice.js file

// Update transaction
export const updateTransaction = createAsyncThunk(
  'transactions/update',
  async ({ id, data }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const response = await axios.put(`/api/transactions/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Then in your reducers, add:
// Create the slice
export const transactionSlice = createSlice({
  name: 'transactions',
  initialState: {
    transactions: [],
    stats: {
      income: 0,
      expenses: 0,
      balance: 0
    },
    blockchainStatus: null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
  },
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
      .addCase(getTransactions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.transactions = action.payload;
        
        // Calculate stats
        let income = 0;
        let expenses = 0;
        
        action.payload.forEach(transaction => {
          if (transaction.type === 'income') {
            income += transaction.amount;
          } else {
            expenses += transaction.amount;
          }
        });
        
        state.stats = {
          income,
          expenses,
          balance: income - expenses
        };
      })
      .addCase(getTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createTransaction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.transactions.push(action.payload);
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getBlockchainStatus.fulfilled, (state, action) => {
        state.blockchainStatus = action.payload;
      })
      .addCase(updateTransaction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Update the transaction in the state
        state.transactions = state.transactions.map(transaction => 
          transaction._id === action.payload._id ? action.payload : transaction
        );
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset } = transactionSlice.actions;
export default transactionSlice.reducer;
