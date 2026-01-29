const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Max 10 attempts per 15 minutes
  message: 'Too many login/registration attempts, please try again after 15 minutes'
});

module.exports = { apiLimiter, authLimiter };