const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000 // 1000 requests per minute
});

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100, // 100 attempts per minute
  message: {
    success: false,
    error: 'Too many attempts',
    message: 'Too many login/registration attempts, please try again after 1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, authLimiter };