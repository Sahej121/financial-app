const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const creditCardController = require('../controllers/creditCardController');

router.post('/apply',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').matches(/^[0-9]{10}$/).withMessage('Valid 10-digit phone number is required'),
    body('pan').matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).withMessage('Valid PAN number is required'),
    body('dob').isISO8601().withMessage('Valid date is required'),
    body('pincode').matches(/^[0-9]{6}$/).withMessage('Valid 6-digit pincode is required'),
    validate
  ],
  creditCardController.applyForCard
);

router.get('/recommendations', creditCardController.getRecommendations);

module.exports = router; 