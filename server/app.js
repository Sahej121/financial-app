const express = require('express');
const consultationRoutes = require('./routes/consultationRoutes');

const app = express();

// Mount consultation routes
app.use('/api', consultationRoutes);

// Add this middleware to serve uploaded files
app.use('/uploads', express.static('uploads'));

// ... other middleware ...

module.exports = app; 