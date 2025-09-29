const express = require('express');
const router = express.Router();
const robustAuthController = require('../controllers/robustAuthController');
const { authenticateToken, rateLimit } = require('../middleware/robustAuth');
const { asyncHandler } = require('../middleware/robustErrorHandler');

// Apply rate limiting to auth routes
router.use(rateLimit(10, 15 * 60 * 1000)); // 10 requests per 15 minutes

// Public routes
router.post('/register', asyncHandler(robustAuthController.register));
router.post('/login', asyncHandler(robustAuthController.login));
router.get('/health', asyncHandler(robustAuthController.healthCheck));

// Protected routes
router.get('/profile', authenticateToken, asyncHandler(robustAuthController.getProfile));
router.get('/verify', authenticateToken, asyncHandler(robustAuthController.verifyToken));
router.post('/logout', authenticateToken, asyncHandler(robustAuthController.logout));

module.exports = router;
