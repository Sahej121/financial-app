const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { sequelize } = require('./models');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1); // Trust first proxy (needed for rate limiter behind proxy)

// Middleware
app.use(cors());
app.use(express.json());
app.use(apiLimiter);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to SQLite with Sequelize
sequelize.authenticate()
  .then(() => {
    console.log('Connected to SQLite database');
    // Using alter: false by default for SQLite stability in dev
    // If schema changes are needed, run with DB_ALTER=true
    const shouldAlter = process.env.DB_ALTER === 'true';
    return sequelize.sync({ force: false, alter: shouldAlter });
  })
  .then(() => {
    console.log('Database synchronized');
  })
  .catch(err => {
    console.error('Database connection error:', err);
    console.log('Attempting to start server anyway...');
  });

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, 'localhost', () => {
  console.log(`Server is running on localhost:${PORT}`);
}); 