const express = require('express');
const router = express.Router();
const financialPlanningController = require('../controllers/financialPlanningController');
const { auth } = require('../controllers/authController');
const requireRole = require('../middleware/requireRole');

// Submit financial planning form
router.post('/submit', 
  auth, 
  requireRole(['user', 'premium']), 
  financialPlanningController.submitFinancialPlan
);

// Get user's submissions
router.get('/my-submissions', 
  auth, 
  requireRole(['user', 'premium']), 
  financialPlanningController.getUserSubmissions
);

// Get submission details
router.get('/submission/:id', 
  auth, 
  requireRole(['user', 'premium']), 
  financialPlanningController.getSubmissionDetails
);

// Admin/Analyst routes
router.get('/all-submissions', 
  auth, 
  requireRole(['admin', 'financial_planner']), 
  financialPlanningController.getAllSubmissions
);

router.patch('/submission/:id/status', 
  auth, 
  requireRole(['admin', 'financial_planner']), 
  financialPlanningController.updateSubmissionStatus
);

module.exports = router; 