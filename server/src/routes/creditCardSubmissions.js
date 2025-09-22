const express = require('express');
const router = express.Router();
const creditCardSubmissionController = require('../controllers/creditCardSubmissionController');
const { auth } = require('../controllers/authController');
const requireRole = require('../middleware/requireRole');

// Submit credit card form
router.post('/submit', 
  auth, 
  requireRole(['user', 'premium']), 
  creditCardSubmissionController.submitCreditCardForm
);

// Get user's submissions
router.get('/my-submissions', 
  auth, 
  requireRole(['user', 'premium']), 
  creditCardSubmissionController.getUserSubmissions
);

// Get submission details
router.get('/submission/:id', 
  auth, 
  requireRole(['user', 'premium']), 
  creditCardSubmissionController.getSubmissionDetails
);

// Update recommendations for a submission
router.patch('/submission/:id/recommendations', 
  auth, 
  requireRole(['user', 'premium']), 
  creditCardSubmissionController.updateRecommendations
);

// Admin routes
router.get('/all-submissions', 
  auth, 
  requireRole(['admin']), 
  creditCardSubmissionController.getAllSubmissions
);

router.patch('/submission/:id/status', 
  auth, 
  requireRole(['admin']), 
  creditCardSubmissionController.updateSubmissionStatus
);

router.get('/analytics', 
  auth, 
  requireRole(['admin']), 
  creditCardSubmissionController.getAnalytics
);

module.exports = router; 