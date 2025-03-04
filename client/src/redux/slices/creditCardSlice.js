import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const submitCreditCardForm = createAsyncThunk(
  'creditCard/submit',
  async (formData) => {
    const response = await axios.post('/api/credit-cards/recommend', formData);
    return response.data;
  }
);

export const submitCardApplication = createAsyncThunk(
  'creditCard/apply',
  async (applicationData) => {
    const response = await axios.post('/api/credit-cards/apply', applicationData);
    return response.data;
  }
);

const creditCardSlice = createSlice({
  name: 'creditCard',
  initialState: {
    recommendations: [],
    loading: false,
    error: null,
    formSubmitted: false,
    applicationLoading: false,
    applicationError: null
  },
  reducers: {
    clearRecommendations: (state) => {
      state.recommendations = [];
      state.formSubmitted = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitCreditCardForm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitCreditCardForm.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendations = action.payload;
        state.error = null;
        state.formSubmitted = true;
      })
      .addCase(submitCreditCardForm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.formSubmitted = false;
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

export const { clearRecommendations } = creditCardSlice.actions;
export default creditCardSlice.reducer; 