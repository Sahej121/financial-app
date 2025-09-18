const { Meeting, User, Document } = require('../models');
const { Op } = require('sequelize');

// Get user's meetings (for clients)
exports.getUserMeetings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, upcoming } = req.query;
    
    const whereClause = { clientId: userId };
    
    if (status) {
      // Support multiple comma-separated statuses
      if (status.includes(',')) {
        whereClause.status = { [Op.in]: status.split(',').map(s => s.trim()) };
      } else {
        whereClause.status = status;
      }
    }
    
    if (upcoming === 'true') {
      whereClause.startsAt = { [Op.gt]: new Date() };
    }
    
    const meetings = await Meeting.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'professional',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [['startsAt', 'ASC']]
    });
    
    res.json({
      success: true,
      meetings: meetings.map(meeting => ({
        ...meeting.toJSON(),
        // Only include join URL for clients, not start URL
        zoomStartUrl: undefined
      }))
    });
  } catch (error) {
    console.error('Get user meetings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meetings'
    });
  }
};

// Get professional's assigned meetings (for CAs and Financial Planners)
exports.getProfessionalMeetings = async (req, res) => {
  try {
    const professionalId = req.user.id;
    const { role, status, upcoming } = req.query;
    
    const whereClause = { professionalId };
    
    // Filter by professional role if specified
    if (role && ['ca', 'financial_planner'].includes(role)) {
      whereClause.professionalRole = role;
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    if (upcoming === 'true') {
      whereClause.startsAt = { [Op.gt]: new Date() };
    }
    
    const meetings = await Meeting.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'client',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Document,
          as: 'documents',
          attributes: ['id', 'fileName', 'uploadedAt', 'status'],
          through: { attributes: [] }
        }
      ],
      order: [['startsAt', 'ASC']]
    });
    
    res.json({
      success: true,
      meetings
    });
  } catch (error) {
    console.error('Get professional meetings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch professional meetings'
    });
  }
};

// Create a new meeting
exports.createMeeting = async (req, res) => {
  try {
    const {
      clientId,
      professionalId,
      professionalRole,
      title,
      planningType,
      startsAt,
      endsAt,
      description,
      clientNotes
    } = req.body;
    
    // Validate required fields
    if (!clientId || !professionalId || !professionalRole || !startsAt || !endsAt) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Validate professional role
    if (!['ca', 'financial_planner'].includes(professionalRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid professional role'
      });
    }
    
    // Verify the professional exists and has the correct role
    const professional = await User.findByPk(professionalId);
    if (!professional || professional.role !== professionalRole) {
      return res.status(400).json({
        success: false,
        message: 'Invalid professional assignment'
      });
    }
    
    // Verify the client exists
    const client = await User.findByPk(clientId);
    if (!client || client.role !== 'user') {
      return res.status(400).json({
        success: false,
        message: 'Invalid client'
      });
    }
    
    // Create the meeting
    const meeting = await Meeting.create({
      clientId,
      professionalId,
      professionalRole,
      title: title || 'Financial Consultation',
      planningType: planningType || 'financial_planning',
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
      description,
      clientNotes,
      status: 'scheduled'
    });
    
    // Fetch the created meeting with associations
    const createdMeeting = await Meeting.findByPk(meeting.id, {
      include: [
        {
          model: User,
          as: 'client',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'professional',
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      meeting: createdMeeting,
      message: 'Meeting created successfully'
    });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create meeting'
    });
  }
};

// Update meeting status
exports.updateMeetingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, rating, feedback } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const validStatuses = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const meeting = await Meeting.findByPk(id);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }
    
    // Check permissions - only the professional or client can update
    if (meeting.professionalId !== req.user.id && meeting.clientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this meeting'
      });
    }
    
    // Update fields
    const updateData = { status };
    if (notes) updateData.notes = notes;
    if (rating) updateData.rating = rating;
    if (feedback) updateData.feedback = feedback;
    
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }
    
    await meeting.update(updateData);
    
    // Fetch updated meeting with associations
    const updatedMeeting = await Meeting.findByPk(id, {
      include: [
        {
          model: User,
          as: 'client',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'professional',
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    });
    
    res.json({
      success: true,
      meeting: updatedMeeting,
      message: 'Meeting updated successfully'
    });
  } catch (error) {
    console.error('Update meeting status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update meeting'
    });
  }
};

// Generate Zoom meeting link (professional only)
exports.generateZoomLink = async (req, res) => {
  try {
    const { id } = req.params;
    
    const meeting = await Meeting.findByPk(id);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }
    
    // Only the assigned professional can generate Zoom links
    if (meeting.professionalId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned professional can generate meeting links'
      });
    }
    
    // TODO: Integrate with Zoom API to create actual meeting
    // For now, we'll create mock URLs
    const zoomMeetingId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const baseUrl = `https://zoom.us/j/${zoomMeetingId}`;
    
    const updateData = {
      zoomMeetingId,
      zoomJoinUrl: `${baseUrl}?pwd=example`,
      zoomStartUrl: `${baseUrl}?role=1&pwd=example`,
      zoomPassword: 'meetingPass123'
    };
    
    await meeting.update(updateData);
    
    res.json({
      success: true,
      zoomDetails: {
        meetingId: zoomMeetingId,
        joinUrl: updateData.zoomJoinUrl,
        startUrl: updateData.zoomStartUrl,
        password: updateData.zoomPassword
      },
      message: 'Zoom meeting link generated successfully'
    });
  } catch (error) {
    console.error('Generate Zoom link error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate Zoom link'
    });
  }
};