const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const { auth } = require('../controllers/authController');
const requireRole = require('../middleware/requireRole');

// Get user's own meetings (clients only)
router.get('/user', 
  auth, 
  requireRole(['user']), 
  meetingController.getUserMeetings
);

// Get professional's assigned meetings (CAs and Financial Planners)
router.get('/professional', 
  auth, 
  requireRole(['ca', 'financial_planner']), 
  meetingController.getProfessionalMeetings
);

// Create a new meeting (admins, professionals can create)
router.post('/', 
  auth, 
  requireRole(['admin', 'ca', 'financial_planner']), 
  meetingController.createMeeting
);

// Update meeting status (participants only)
router.patch('/:id/status', 
  auth, 
  meetingController.updateMeetingStatus
);

// Generate Zoom meeting link (professionals only)
router.post('/:id/zoom-link', 
  auth, 
  requireRole(['ca', 'financial_planner']), 
  meetingController.generateZoomLink
);

module.exports = router;