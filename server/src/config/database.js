const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Database configuration
module.exports = {
  dialect: process.env.DB_DIALECT || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'financial_app',
  logging: false,
  // Add support for DATABASE_URL connection string (common in production)
  use_env_variable: 'DATABASE_URL',
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  // Keep SQLite config as fallback if needed, or remove
  // storage: path.join(__dirname, '../../database.sqlite'),
};