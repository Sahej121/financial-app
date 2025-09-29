require('dotenv').config();
const { db } = require('../../../database/models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const validator = require('validator');

// Enhanced error handling
const handleError = (res, error, operation = 'operation') => {
  console.error(`${operation} error:`, error);
  
  // Database connection errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(503).json({
      success: false,
      error: 'Database connection failed',
      message: 'Service temporarily unavailable. Please try again later.',
      code: 'DB_CONNECTION_ERROR'
    });
  }
  
  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: error.message,
      code: 'VALIDATION_ERROR'
    });
  }
  
  // Duplicate entry errors
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      error: 'Duplicate Entry',
      message: 'This email is already registered',
      code: 'DUPLICATE_EMAIL'
    });
  }
  
  // Default server error
  return res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: 'An unexpected error occurred. Please try again later.',
    code: 'INTERNAL_ERROR'
  });
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET || 'fallback-secret-key',
    { expiresIn: '24h' }
  );
};

// Input validation
const validateEmail = (email) => {
  if (!email || !validator.isEmail(email)) {
    throw new Error('Please provide a valid email address');
  }
  return true;
};

const validatePassword = (password) => {
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  return true;
};

const validateName = (name) => {
  if (!name || name.trim().length < 2) {
    throw new Error('Name must be at least 2 characters long');
  }
  return true;
};

// Enhanced registration
exports.register = async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;
    
    // Input validation
    validateName(name);
    validateEmail(email);
    validatePassword(password);
    
    // Validate role
    const allowedRoles = ['user', 'ca', 'analyst', 'admin'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Role',
        message: 'Invalid role specified',
        code: 'INVALID_ROLE'
      });
    }
    
    // Check if user already exists
    const existingUser = await db.userAuth.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User Exists',
        message: 'This email is already registered',
        code: 'USER_EXISTS'
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);
    
    // Create user
    const userId = await db.userAuth.createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
      salt,
      role,
      is_verified: false
    });
    
    // Log registration activity
    await db.metadataAnalytics.logActivity({
      user_id: userId,
      activity_type: 'USER_REGISTRATION',
      activity_description: 'User registered successfully',
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('User-Agent'),
      metadata: { role }
    });
    
    // Generate token
    const token = generateToken({ id: userId, email, role });
    
    // Get created user
    const user = await db.userAuth.findById(userId);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          is_verified: user.is_verified
        },
        token
      }
    });
    
  } catch (error) {
    handleError(res, error, 'Registration');
  }
};

// Enhanced login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Input validation
    validateEmail(email);
    validatePassword(password);
    
    // Find user
    const user = await db.userAuth.findByEmail(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication Failed',
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Check if account is locked
    if (user.locked_until && new Date() < new Date(user.locked_until)) {
      return res.status(423).json({
        success: false,
        error: 'Account Locked',
        message: 'Account is temporarily locked due to multiple failed attempts',
        code: 'ACCOUNT_LOCKED'
      });
    }
    
    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Account Disabled',
        message: 'Your account has been disabled. Please contact support.',
        code: 'ACCOUNT_DISABLED'
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      // Increment login attempts
      await db.userAuth.incrementLoginAttempts(email);
      
      return res.status(401).json({
        success: false,
        error: 'Authentication Failed',
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Reset login attempts on successful login
    await db.userAuth.updateLastLogin(user.id, req.ip);
    
    // Generate token
    const token = generateToken(user);
    
    // Log successful login
    await db.metadataAnalytics.logActivity({
      user_id: user.id,
      activity_type: 'USER_LOGIN',
      activity_description: 'User logged in successfully',
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('User-Agent')
    });
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          is_verified: user.is_verified,
          last_login: user.last_login
        },
        token
      }
    });
    
  } catch (error) {
    handleError(res, error, 'Login');
  }
};

// Enhanced profile retrieval
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user with profile
    const userWithProfile = await db.getUserWithProfile(userId);
    
    if (!userWithProfile) {
      return res.status(404).json({
        success: false,
        error: 'User Not Found',
        message: 'User profile not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      data: {
        user: {
          id: userWithProfile.id,
          name: userWithProfile.name,
          email: userWithProfile.email,
          role: userWithProfile.role,
          is_verified: userWithProfile.is_verified,
          created_at: userWithProfile.created_at,
          last_login: userWithProfile.last_login
        },
        profile: userWithProfile.profile
      }
    });
    
  } catch (error) {
    handleError(res, error, 'Get Profile');
  }
};

// Token verification
exports.verifyToken = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No Token',
        message: 'No authentication token provided',
        code: 'NO_TOKEN'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    const user = await db.userAuth.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User Not Found',
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          is_verified: user.is_verified
        }
      }
    });
    
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
    
    handleError(res, error, 'Token Verification');
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      // In a production system, you might want to blacklist the token
      // For now, we'll just log the logout activity
      await db.metadataAnalytics.logActivity({
        user_id: req.user.id,
        activity_type: 'USER_LOGOUT',
        activity_description: 'User logged out successfully',
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.get('User-Agent')
      });
    }
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
    
  } catch (error) {
    handleError(res, error, 'Logout');
  }
};

// Health check
exports.healthCheck = async (req, res) => {
  try {
    // Test database connections
    const connections = await db.testConnections();
    const allConnected = Object.values(connections).every(conn => conn.status === 'connected');
    
    if (!allConnected) {
      return res.status(503).json({
        success: false,
        error: 'Service Unavailable',
        message: 'Database connections failed',
        code: 'DB_CONNECTION_ERROR',
        details: connections
      });
    }
    
    res.json({
      success: true,
      message: 'Service is healthy',
      data: {
        timestamp: new Date().toISOString(),
        database: 'connected',
        version: '1.0.0'
      }
    });
    
  } catch (error) {
    handleError(res, error, 'Health Check');
  }
};
