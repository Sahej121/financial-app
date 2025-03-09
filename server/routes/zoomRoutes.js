const express = require('express');
const router = express.Router();
const zoomController = require('../controllers/zoomController');

router.post('/meetings', zoomController.createMeeting);
router.put('/meetings/:meetingId/end', zoomController.endMeeting);

module.exports = router; 