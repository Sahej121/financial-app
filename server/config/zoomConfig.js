const axios = require('axios');
const jwt = require('jsonwebtoken');

const ZOOM_API_KEY = process.env.ZOOM_API_KEY;
const ZOOM_API_SECRET = process.env.ZOOM_API_SECRET;
const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;

// Generate Zoom JWT Token
const generateZoomToken = () => {
  const payload = {
    iss: ZOOM_API_KEY,
    exp: ((new Date()).getTime() + 5000)
  };
  
  return jwt.sign(payload, ZOOM_API_SECRET);
};

// Zoom API Client
const zoomClient = axios.create({
  baseURL: 'https://api.zoom.us/v2',
  headers: {
    'User-Agent': 'Zoom-api-Jwt-Request',
    'Content-Type': 'application/json'
  }
});

// Add token to requests
zoomClient.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${generateZoomToken()}`;
  return config;
});

module.exports = { zoomClient }; 