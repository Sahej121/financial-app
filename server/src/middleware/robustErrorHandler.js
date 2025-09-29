const { db } = require('../../../database/models');

// Enhanced error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  // Log error to database if possible
  if (req.user && req.user.id) {
    db.metadataAnalytics.logActivity({
      user_id: req.user.id,
      activity_type: 'ERROR_OCCURRED',
      activity_description: `Error: ${err.message}`,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('User-Agent'),
      metadata: {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
      }
    }).catch(logError => {
      console.error('Failed to log error to database:', logError);
    });
  }
  
  // Handle different types of errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Please check your input data',
      details: Object.values(err.errors).map(e => e.message),
      code: 'VALIDATION_ERROR'
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid Data',
      message: 'Invalid data format provided',
      code: 'INVALID_DATA'
    });
  }
  
  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(503).json({
      success: false,
      error: 'Service Unavailable',
      message: 'Database connection failed. Please try again later.',
      code: 'DB_CONNECTION_ERROR'
    });
  }
  
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      error: 'Duplicate Entry',
      message: 'This record already exists',
      code: 'DUPLICATE_ENTRY'
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid Token',
      message: 'Invalid authentication token',
      code: 'INVALID_TOKEN'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token Expired',
      message: 'Authentication token has expired',
      code: 'TOKEN_EXPIRED'
    });
  }
  
  // Handle network errors
  if (err.code === 'ENOTFOUND' || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
    return res.status(503).json({
      success: false,
      error: 'Network Error',
      message: 'Network connection failed. Please check your internet connection.',
      code: 'NETWORK_ERROR'
    });
  }
  
  // Handle file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: 'File Too Large',
      message: 'File size exceeds the maximum allowed limit',
      code: 'FILE_TOO_LARGE'
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: 'Invalid File',
      message: 'Unexpected file field',
      code: 'INVALID_FILE'
    });
  }
  
  // Default server error
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'An unexpected error occurred. Please try again later.'
    : err.message;
  
  res.status(statusCode).json({
    success: false,
    error: 'Internal Server Error',
    message: message,
    code: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

// 404 handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`,
    code: 'ROUTE_NOT_FOUND'
  });
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
