import axios from 'axios';

export const setupAxiosDefaults = () => {
  axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
}; 