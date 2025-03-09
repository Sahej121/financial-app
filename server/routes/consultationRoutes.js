const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');

// Route to create a new consultation
router.post('/consultations', consultationController.createConsultation);

// Route to get analyst schedule
router.get('/analyst-schedule', consultationController.getAnalystSchedule);

module.exports = router; 