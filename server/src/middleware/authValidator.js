const { body } = require('express-validator');

exports.registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['user', 'ca', 'financial_planner', 'admin', 'premium']).withMessage('Invalid role'),
];

exports.loginValidation = [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required'),
];
