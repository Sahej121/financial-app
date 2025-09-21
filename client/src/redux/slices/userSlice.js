import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const register = createAsyncThunk(
  'user/register',
  async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data?.token) {
      try {
        localStorage.setItem('token', response.data.token);
      } catch (error) {
        console.error('Failed to store token:', error);
      }
    }
    return response.data;
  }
);
export const login = createAsyncThunk(
  'user/login',
  async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data?.token) {
      try {
        localStorage.setItem('token', response.data.token);
      } catch (error) {
        console.error('Failed to store token:', error);
      }
    }
    return response.data;
  }
);
export const getProfile = createAsyncThunk(
  'user/getProfile',
  async (_, { getState }) => {
    const { token } = getState().user;
    const response = await api.get('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: (() => {
      try {
        return JSON.parse(localStorage.getItem('user') || 'null');
      } catch {
        return null;
      }
    })(),
    token: localStorage.getItem('token'),
    loading: false,
    error: null
  },  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));
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
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      });
  }
});

export const { logout } = userSlice.actions;
export default userSlice.reducer; 