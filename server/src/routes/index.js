const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const caController = require('../controllers/caController');
const documentController = require('../controllers/documentController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const creditCardController = require('../controllers/creditCardController');
const meetingsRouter = require('./meetings');

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);
router.put('/auth/reset-password/:resetToken', authController.resetPassword);
router.get('/auth/profile', authController.auth, authController.getProfile);
router.put('/auth/update-profile', authController.auth, authController.updateProfile);
router.put('/auth/update-settings', authController.auth, authController.updateSettings);

// CA routes
router.get('/cas', caController.getCAs);
router.post('/cas', caController.createCA);

// Meeting routes
router.use('/meetings', meetingsRouter);

// Document routes (enhanced) - this must come BEFORE any specific document routes
const documentsRouter = require('./documents');
router.use('/documents', documentsRouter);

// Analytics routes
const analyticsRouter = require('./analytics');
router.use('/analytics', analyticsRouter);

// Credit Card routes
if (creditCardController && creditCardController.getRecommendations) {
  router.post('/credit-cards/recommend', creditCardController.getRecommendations);
}
if (creditCardController && creditCardController.getCreditCardRecommendations) {
  router.post('/credit-cards/recommend-enhanced', creditCardController.getCreditCardRecommendations);
}
// fallback logic...

if (creditCardController && creditCardController.applyForCard) {
  router.post('/credit-cards/apply', creditCardController.applyForCard);
} else {
  console.error('Warning: creditCardController.applyForCard is not properly defined');
  // Provide a fallback
  router.post('/credit-cards/apply', (req, res) => {
    res.status(501).json({ error: 'Not implemented yet' });
  });
}

// Add credit card feedback route if it exists
if (creditCardController && creditCardController.submitCardFeedback) {
  router.post('/creditCard/feedback', creditCardController.submitCardFeedback);
}

// Feedback routes
const feedbackRoutes = require('./feedback');
router.use('/feedback', feedbackRoutes);

// Financial Planning routes
const financialPlanningRoutes = require('./financialPlanning');
router.use('/financial-planning', financialPlanningRoutes);

// Financial Planner (Analyst) Profile Routes
const financialPlannerController = require('../controllers/financialPlannerController');
router.post('/financial-planners', financialPlannerController.createFinancialPlanner);
router.get('/financial-planners/stats', financialPlannerController.getAnalystStats);

// Credit Card Submissions routes
const creditCardSubmissionRoutes = require('./creditCardSubmissions');
router.use('/credit-card-submissions', creditCardSubmissionRoutes);

module.exports = router; 