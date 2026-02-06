const errorHandler = (err, req, res, next) => {
  // Always log errors - use structured logging in production
  if (process.env.NODE_ENV === 'production') {
    // Replace with your logging service (e.g., Winston, Pino, or external service)
    console.error(JSON.stringify({
      error: err.message,
      name: err.name,
      stack: err.stack,
      timestamp: new Date().toISOString()
    }));
  } else {
    console.error(err.stack);
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError' || (err.name === 'MongoError' && err.code === 11000)) {
    return res.status(400).json({
      success: false,
      error: 'Duplicate Entry',
      message: 'This record already exists'
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid session',
      message: 'Please log in again'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Session expired',
      message: 'Your session has expired, please log in again'
    });
  }

  // Final fallback
  const response = {
    success: false,
    error: 'Internal Server Error',
    message: 'An unexpected error occurred. Please try again later.'
  };

  // Only expose details if NOT in production
  if (process.env.NODE_ENV !== 'production') {
    response.message = err.message;
    response.stack = err.stack;
  }

  res.status(err.status || 500).json(response);
};

module.exports = errorHandler; 