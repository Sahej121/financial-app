require('dotenv').config();
const path = require('path');

// SQLite database configuration
module.exports = {
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: false
}; 