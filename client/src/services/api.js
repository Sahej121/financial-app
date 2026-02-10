import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging and error handling
api.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });

    if (error.response?.status === 401) {
      // Clear local storage on auth error
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // We don't necessarily want to redirect to /login immediately here
      // because some pages might be partially public.
      // The ProtectedRoute/RoleBasedRoute will handle redirection.
    }

    return Promise.reject(error);
  }
);

// Add token to requests if available
api.interceptors.request.use(
  async (config) => {
    // 1. Attach JWT Token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Handle CSRF Token for non-GET requests
    const stateChangingMethods = ['post', 'put', 'delete', 'patch'];
    if (stateChangingMethods.includes(config.method?.toLowerCase()) && !config._isCsrfFetch) {
      try {
        if (!window._csrfToken) {
          console.log('Fetching fresh CSRF token via api instance...');
          // Use the 'api' instance to ensure withCredentials and baseURL are handled correctly
          // We use a custom flag _isCsrfFetch to avoid recursion in this interceptor
          const { data } = await api.get('/csrf-token', {
            _isCsrfFetch: true,
            headers: { 'Accept': 'application/json' }
          });

          if (data && data.token) {
            window._csrfToken = data.token;
          }
        }

        if (window._csrfToken) {
          config.headers['x-csrf-token'] = window._csrfToken;
        }
      } catch (err) {
        console.error('Failed to handle CSRF token:', err);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (credentials) => {
    try {
      console.log('Attempting login with:', credentials);
      const response = await api.post('/auth/login', credentials);
      console.log('Login response:', response.data);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data || error;
    }
  },

  register: async (userData) => {
    try {
      console.log('Attempting registration with:', userData);
      const response = await api.post('/auth/register', userData);
      console.log('Registration response:', response.data);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error.response?.data || error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default api; 