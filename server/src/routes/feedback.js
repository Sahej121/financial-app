const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Middleware for basic validation
const validateFeedback = (req, res, next) => {
  const { name, email, feedbackType, message } = req.body;
  
  if (!name || !email || !feedbackType || !message) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: name, email, feedbackType, and message are required'
    });
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }
  
  next();
};

// Routes
router.post('/', validateFeedback, feedbackController.submitFeedback);
router.get('/stats', feedbackController.getFeedbackStats);

module.exports = router; 