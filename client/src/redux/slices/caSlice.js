import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  cas: [],
  loading: false,
  error: null,
  filters: {
    experience: 'all',
    priceRange: [0, 5000],
    specialization: 'all'
  }
};

export const fetchCAs = createAsyncThunk(
  'ca/fetchCAs',
  async ({ experience, priceRange, specialization }) => {
    const response = await axios.get('/api/cas', {
      params: {
        experience,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        specialization
      }
    });
    return response.data;
  }
);

const caSlice = createSlice({
  name: 'ca',
  initialState: initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCAs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCAs.fulfilled, (state, action) => {
        state.loading = false;
        state.cas = action.payload;
        state.error = null;
      })
      .addCase(fetchCAs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { setFilters } = caSlice.actions;
export default caSlice.reducer; 