import axios from 'axios';

// Enhanced API configuration with better error handling
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3001/api';

// Create axios instance with enhanced configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
  // Force IPv4 to avoid connection issues
  family: 4,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching issues
    config.params = {
      ...config.params,
      _t: Date.now()
    };
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });
    
    // Enhanced error handling
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return Promise.reject({
        success: false,
        error: 'Network Error',
        message: 'Unable to connect to server. Please check your internet connection and try again.',
        code: 'NETWORK_ERROR'
      });
    }
    
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        success: false,
        error: 'Timeout Error',
        message: 'Request timed out. Please try again.',
        code: 'TIMEOUT_ERROR'
      });
    }
    
    if (error.response) {
      // Server responded with error status
      return Promise.reject({
        success: false,
        error: error.response.data?.error || 'Server Error',
        message: error.response.data?.message || 'An error occurred on the server',
        code: error.response.data?.code || 'SERVER_ERROR',
        status: error.response.status
      });
    }
    
    // Network error or other issues
    return Promise.reject({
      success: false,
      error: 'Network Error',
      message: 'Network connection failed. Please check your internet connection.',
      code: 'NETWORK_ERROR'
    });
  }
);

// Enhanced authentication service
export const auth = {
  login: async (credentials) => {
    try {
      console.log('🔐 Attempting login...');
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success && response.data.data?.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        console.log('✅ Login successful');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      console.log('📝 Attempting registration...');
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success && response.data.data?.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        console.log('✅ Registration successful');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('👋 Logged out');
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      // If token verification fails, clear local storage
      auth.logout();
      throw error;
    }
  }
};

// Health check service
export const health = {
  check: async () => {
    try {
      const response = await axios.get('http://127.0.0.1:3001/health', {
        timeout: 5000,
        family: 4
      });
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw {
        success: false,
        error: 'Health Check Failed',
        message: 'Server is not responding. Please try again later.',
        code: 'HEALTH_CHECK_FAILED'
      };
    }
  }
};

// Utility function to test connection
export const testConnection = async () => {
  try {
    console.log('🔍 Testing server connection...');
    const healthData = await health.check();
    console.log('✅ Server is healthy:', healthData);
    return true;
  } catch (error) {
    console.error('❌ Server connection failed:', error);
    return false;
  }
};

export default api;
