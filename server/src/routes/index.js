const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const caController = require('../controllers/caController');
const documentController = require('../controllers/documentController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const creditCardController = require('../controllers/creditCardController');

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/profile', authController.getProfile);

// CA routes
router.get('/cas', caController.getCAs);

// Document routes
router.post('/documents/upload', authController.auth, upload.single('file'), documentController.uploadDocument);

// Credit Card routes
router.post('/credit-cards/recommend', creditCardController.getRecommendations);
router.post('/credit-cards/apply', creditCardController.applyForCard);

module.exports = router; 