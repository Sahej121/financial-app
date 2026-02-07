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
    if (stateChangingMethods.includes(config.method?.toLowerCase())) {
      try {
        // Simple strategy: Fetch fresh token if we don't have one in a variable 
        // Or you can store it in memory. For simplicity here, we fetch it or 
        // the server can also provide it in a cookie that we read.
        // Let's use the /api/csrf-token endpoint.

        // Avoid infinite loop if we are already fetching the token
        if (!config.url?.includes('csrf-token')) {
          // Use a relative path that doesn't duplicate /api if BASE_URL already has it
          const csrfPath = '/csrf-token';
          const { data } = await axios.get(`${API_URL.replace(/\/api$/, '')}${csrfPath}`, { withCredentials: true });
          if (data.token) {
            config.headers['x-csrf-token'] = data.token;
          }
        }
      } catch (err) {
        console.error('Failed to fetch CSRF token:', err);
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