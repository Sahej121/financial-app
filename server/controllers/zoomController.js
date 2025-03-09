const { zoomClient } = require('../config/zoomConfig');
const Consultation = require('../models/Consultation');

exports.createMeeting = async (req, res) => {
  try {
    const { consultationId, topic, startTime, duration } = req.body;

    // Create Zoom meeting
    const meetingResponse = await zoomClient.post('/users/me/meetings', {
      topic,
      type: 2, // Scheduled meeting
      start_time: startTime,
      duration, // Duration in minutes
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true,
        audio: 'both'
      }
    });

    // Update consultation with meeting details
    await Consultation.findByIdAndUpdate(consultationId, {
      zoomMeeting: {
        meetingId: meetingResponse.data.id,
        joinUrl: meetingResponse.data.join_url,
        startUrl: meetingResponse.data.start_url,
        password: meetingResponse.data.password
      }
    });

    res.status(200).json({
      success: true,
      meeting: {
        id: meetingResponse.data.id,
        joinUrl: meetingResponse.data.join_url,
        password: meetingResponse.data.password
      }
    });
  } catch (error) {
    console.error('Error creating Zoom meeting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Zoom meeting',
      error: error.message
    });
  }
};

exports.endMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    await zoomClient.put(`/meetings/${meetingId}/status`, {
      action: 'end'
    });

    res.status(200).json({
      success: true,
      message: 'Meeting ended successfully'
    });
  } catch (error) {
    console.error('Error ending Zoom meeting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end meeting',
      error: error.message
    });
  }
}; 