const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { auth } = require('../controllers/authController');
const requireRole = require('../middleware/requireRole');

// Get analytics summary (users only)
router.get('/summary', 
  auth, 
  requireRole(['user']), 
  analyticsController.getAnalyticsSummary
);

// Get chart data for visualizations (users only)
router.get('/charts', 
  auth, 
  requireRole(['user']), 
  analyticsController.getChartData
);

// Get business insights and recommendations (users only)
router.get('/insights', 
  auth, 
  requireRole(['user']), 
  analyticsController.getBusinessInsights
);

module.exports = router;