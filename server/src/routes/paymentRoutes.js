const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const AuthGuard = require('../middleware/auth');

// Protect all payment routes
router.use(AuthGuard);

router.post('/create-order', paymentController.createOrder);
router.post('/verify-payment', paymentController.verifyPayment);

module.exports = router;
