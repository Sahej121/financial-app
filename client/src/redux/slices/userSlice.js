import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const register = createAsyncThunk(
  'user/register',
  async (userData) => {
    const response = await axios.post('/api/auth/register', userData);
    localStorage.setItem('token', response.data.token);
    return response.data;
  }
);

export const login = createAsyncThunk(
  'user/login',
  async (credentials) => {
    const response = await axios.post('/api/auth/login', credentials);
    localStorage.setItem('token', response.data.token);
    return response.data;
  }
);

export const getProfile = createAsyncThunk(
  'user/getProfile',
  async (_, { getState }) => {
    const { token } = getState().user;
    const response = await axios.get('/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
      });
  }
});

export const { logout } = userSlice.actions;
export default userSlice.reducer; 