const jwt = require('jsonwebtoken');
const { db } = require('../../../database/models');

// Enhanced authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access Denied',
        message: 'No authentication token provided',
        code: 'NO_TOKEN'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    // Get user from database
    const user = await db.userAuth.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Token',
        message: 'User not found',
        code: 'INVALID_TOKEN'
      });
    }
    
    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Account Disabled',
        message: 'Your account has been disabled',
        code: 'ACCOUNT_DISABLED'
      });
    }
    
    // Add user to request object
    req.user = user;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid Token',
        message: 'Invalid authentication token',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token Expired',
        message: 'Authentication token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication Error',
      message: 'An error occurred during authentication',
      code: 'AUTH_ERROR'
    });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    
    next();
  };
};

// Rate limiting middleware
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    for (const [key, timestamp] of requests.entries()) {
      if (timestamp < windowStart) {
        requests.delete(key);
      }
    }
    
    // Count requests from this IP
    const userRequests = Array.from(requests.entries())
      .filter(([key, timestamp]) => key.startsWith(ip) && timestamp > windowStart)
      .length;
    
    if (userRequests >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }
    
    // Record this request
    requests.set(`${ip}-${now}`, now);
    
    next();
  };
};

module.exports = {
  authenticateToken,
  authorize,
  rateLimit
};
