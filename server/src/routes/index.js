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
router.get('/auth/profile', authController.getProfile);

// CA routes
router.get('/cas', caController.getCAs);
router.post('/cas', caController.createCA);

// Document routes - temporarily remove auth middleware for testing
router.post('/documents/upload', upload.single('file'), documentController.uploadDocument);

// Meeting routes
router.use('/meetings', meetingsRouter);

// Document routes (enhanced)
const documentsRouter = require('./documents');
router.use('/documents', documentsRouter);

// Analytics routes
const analyticsRouter = require('./analytics');
router.use('/analytics', analyticsRouter);

// Credit Card routes
// Check if controller functions exist before using them
if (creditCardController && creditCardController.getRecommendations) {
  router.post('/credit-cards/recommend', creditCardController.getRecommendations);
} else {
  console.error('Warning: creditCardController.getRecommendations is not properly defined');
  // Provide a fallback
  router.post('/credit-cards/recommend', (req, res) => {
    res.status(501).json({ error: 'Not implemented yet' });
  });
}

if (creditCardController && creditCardController.applyForCard) {
  router.post('/credit-cards/apply', creditCardController.applyForCard);
} else {
  console.error('Warning: creditCardController.applyForCard is not properly defined');
  // Provide a fallback
  router.post('/credit-cards/apply', (req, res) => {
    res.status(501).json({ error: 'Not implemented yet' });
  });
}

module.exports = router; 