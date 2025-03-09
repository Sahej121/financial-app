const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const trackActivity = require('../middleware/activityTracker');

// Route to create a new consultation
router.post('/consultations',
  auth,
  trackActivity(
    'CONSULTATION_SCHEDULED',
    (req, data) => `Scheduled consultation with ${req.body.clientName}`
  ),
  consultationController.createConsultation
);

// Route to get analyst schedule
router.get('/analyst-schedule', consultationController.getAnalystSchedule);

module.exports = router; 