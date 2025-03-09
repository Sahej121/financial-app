import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const submitCreditCardForm = createAsyncThunk(
  'creditCard/submitForm',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/credit-card/submit', formData);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue('An error occurred while submitting the form');
    }
  }
);

export const submitCardApplication = createAsyncThunk(
  'creditCard/apply',
  async (applicationData) => {
    const response = await axios.post('/api/credit-cards/apply', applicationData);
    return response.data;
  }
);

const initialState = {
  loading: false,
  error: null,
  success: false,
  formData: null
};

const creditCardSlice = createSlice({
  name: 'creditCard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    resetForm: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitCreditCardForm.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitCreditCardForm.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.formData = action.payload;
        state.error = null;
      })
      .addCase(submitCreditCardForm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
        state.success = false;
      })
      .addCase(submitCardApplication.pending, (state) => {
        state.applicationLoading = true;
        state.applicationError = null;
      })
      .addCase(submitCardApplication.fulfilled, (state) => {
        state.applicationLoading = false;
        state.applicationError = null;
      })
      .addCase(submitCardApplication.rejected, (state, action) => {
        state.applicationLoading = false;
        state.applicationError = action.error.message;
      });
  }
});

export const { clearError, clearSuccess, resetForm } = creditCardSlice.actions;
export default creditCardSlice.reducer; 