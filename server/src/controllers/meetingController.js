const { Meeting, User, Document, DocumentInsight, ActivityLog, FinancialPlanningSubmission } = require('../models');
const { Op } = require('sequelize');
const zoomService = require('../services/zoomService');

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

// Generate a professional 1-page briefing for a meeting
exports.getBriefing = async (req, res) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id, {
      include: [
        { model: User, as: 'client' },
        {
          model: Document,
          as: 'documents',
          include: [{ model: DocumentInsight, as: 'insight' }]
        }
      ]
    });

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    const { client, documents } = meeting;
    const insights = documents.map(d => d.insight).filter(Boolean);

    // 1. Objective Formatting
    const purposeMap = {
      tax_filing: 'Tax Compliance & Filing',
      loan_expansion: 'Financial Expansion Support',
      compliance_cleanup: 'Regulatory Compliance Cleanup',
      advisory: 'Growth & Tax Advisory'
    };
    const objective = `Client seeking support for ${purposeMap[meeting.engagementPurpose] || 'General Consultation'} for their ${meeting.industry || 'Business'} sector.`;

    // 2. Financial Metrics Snapshot
    const bankInsights = insights.filter(i => i.insightType === 'bank_statement');
    const snapshot = {
      totalCredits: bankInsights.reduce((sum, i) => sum + (i.extractedData.totalCredits || 0), 0),
      totalDebits: bankInsights.reduce((sum, i) => sum + (i.extractedData.totalDebits || 0), 0),
      avgMonthlyBalance: bankInsights.length > 0 ? (bankInsights.reduce((sum, i) => sum + (i.extractedData.avgMonthlyBalance || 0), 0) / bankInsights.length) : 0,
      revenueTrend: meeting.industry === 'salaried' ? 'STABLE' : meeting.turnoverBand === 'over_10cr' ? 'HIGH GROWTH potential' : 'Review in Progress'
    };

    // 3. Risk Matrix (Red/Yellow/Green)
    const riskMatrix = [];
    if (meeting.riskFlags?.notices) riskMatrix.push({ label: 'Past Compliance Notices', status: 'RED' });
    if (meeting.riskFlags?.pending) riskMatrix.push({ label: 'Pending Statutory Filings', status: 'RED' });
    if (meeting.riskFlags?.cashHeavy) riskMatrix.push({ label: 'High Cash Exposure', status: 'ORANGE' });
    if (meeting.riskFlags?.loans) riskMatrix.push({ label: 'Leveraged (Existing Loans)', status: 'YELLOW' });
    if (meeting.riskScore < 20) riskMatrix.push({ label: 'Low Historical Default Risk', status: 'GREEN' });

    // 4. Missing Document Detection
    const isBusiness = ['pvt_ltd', 'llp', 'partnership', 'proprietor'].includes(client?.clientType);
    const providedTitles = documents.map(d => d.fileName.toLowerCase());
    const missingDocs = [];

    if (isBusiness) {
      if (!providedTitles.some(t => t.includes('gst'))) missingDocs.push('GST Returns (GSTR-1/3B)');
      if (!providedTitles.some(t => t.includes('p&l') || t.includes('balance'))) missingDocs.push('Profit & Loss / Balance Sheet');
    } else {
      if (!providedTitles.some(t => t.includes('itr'))) missingDocs.push('Prior Year ITRs');
    }

    // 5. Suggested Agenda
    const agenda = [
      `Clarify the scope of ${purposeMap[meeting.engagementPurpose] || 'consultation'}`,
      `Address reported risk: ${riskMatrix[0]?.label || 'General Background'}`,
      `Review missing data points: ${missingDocs.length > 0 ? missingDocs.join(', ') : 'None'}`
    ];
    if (snapshot.totalCredits > 500000) agenda.push('Discuss tax-efficient growth strategies for high-turnover operations');

    // 6. Diagnostic Questions for CA
    const diagnosticQuestions = [
      `How does the current ${meeting.accountingMethod || 'standard'} accounting method align with your 6-month growth plan?`,
      `Are there any undisclosed personal liabilities that could impact the ${purposeMap[meeting.engagementPurpose] || 'engagement'}?`
    ];
    if (meeting.riskFlags?.cashHeavy) diagnosticQuestions.push('What are the primary controls for daily cash reconciliation to avoid assessment red flags?');
    if (meeting.riskFlags?.crypto) diagnosticQuestions.push('Are all foreign asset disclosures (Schedule FA) up to date for the last assessment year?');

    res.json({
      success: true,
      briefing: {
        objective,
        snapshot,
        riskMatrix,
        missingDocs,
        agenda,
        diagnosticQuestions,
        healthScore: meeting.healthScore,
        referenceNumber: meeting.referenceNumber,
        clientProfile: {
          name: client.name,
          type: client.clientType,
          status: client.residentStatus,
          industry: meeting.industry,
          pan: client.pan ? 'MASKED' : 'Not Provided'
        }
      }
    });

  } catch (error) {
    console.error('Briefing error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate briefing' });
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
        },
        {
          model: FinancialPlanningSubmission,
          as: 'submission'
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
      clientNotes,
      documentIds,
      engagementPurpose,
      engagementType,
      timeSensitivity,
      clientType,
      residentStatus,
      pan,
      aadhaar,
      city,
      state,
      industry,
      turnoverBand,
      incomeSources,
      accountingMethod,
      // Step 3: Risk Assessment fields
      hasPastNotices,
      hasPendingFilings,
      hasLoans,
      hasCryptoForeignAssets,
      isCashHeavy
    } = req.body;

    if (!professionalId || !startsAt || !endsAt) {
      return res.status(400).json({
        success: false,
        message: 'Missing professional ID, start time, or end time'
      });
    }

    const effectiveClientId = clientId || req.user.id;

    const userToUpdate = await User.findByPk(effectiveClientId);
    if (userToUpdate) {
      const profileUpdates = {};
      if (clientType) profileUpdates.clientType = clientType;
      if (residentStatus) profileUpdates.residentStatus = residentStatus;
      if (pan) profileUpdates.pan = pan;
      if (aadhaar) profileUpdates.aadhaar = aadhaar;
      if (city) profileUpdates.city = city;
      if (state) profileUpdates.state = state;
      if (industry) profileUpdates.industry = industry;
      if (turnoverBand) profileUpdates.turnoverBand = turnoverBand;
      if (incomeSources) profileUpdates.incomeSources = incomeSources;
      if (accountingMethod) profileUpdates.accountingMethod = accountingMethod;

      // Risk Profile updates
      if (hasPastNotices !== undefined) profileUpdates.hasPastNotices = hasPastNotices;
      if (hasPendingFilings !== undefined) profileUpdates.hasPendingFilings = hasPendingFilings;
      if (hasLoans !== undefined) profileUpdates.hasLoans = hasLoans;
      if (hasCryptoForeignAssets !== undefined) profileUpdates.hasCryptoForeignAssets = hasCryptoForeignAssets;
      if (isCashHeavy !== undefined) profileUpdates.isCashHeavy = isCashHeavy;

      if (Object.keys(profileUpdates).length > 0) {
        await userToUpdate.update(profileUpdates);
      }
    }

    const professional = await User.findByPk(professionalId);
    if (!professional) {
      return res.status(400).json({
        success: false,
        message: 'Invalid professional assignment'
      });
    }

    const effectiveRole = professionalRole || professional.role;
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const referenceNumber = `${effectiveRole.toUpperCase()}-${year}-${randomSuffix}`;

    // Health Score logic: 100 base score minus risk deductions
    const riskCount = [hasPastNotices, hasPendingFilings, hasLoans, hasCryptoForeignAssets, isCashHeavy].filter(Boolean).length;
    const healthScore = Math.max(10, 100 - (riskCount * 15));

    const meeting = await Meeting.create({
      clientId: effectiveClientId,
      professionalId,
      professionalRole: effectiveRole,
      referenceNumber,
      healthScore,
      title: title || 'Financial Consultation',
      planningType: planningType || 'financial_planning',
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
      description,
      clientNotes,
      status: 'scheduled',
      engagementPurpose,
      engagementType,
      timeSensitivity,
      industry,
      turnoverBand,
      incomeSources,
      accountingMethod,
      riskFlags: {
        notices: hasPastNotices,
        pending: hasPendingFilings,
        loans: hasLoans,
        crypto: hasCryptoForeignAssets,
        cashHeavy: isCashHeavy
      },
      riskScore: [hasPastNotices, hasPendingFilings, hasLoans, hasCryptoForeignAssets, isCashHeavy].filter(Boolean).length * 20
    });

    // Link documents if provided
    if (documentIds && Array.isArray(documentIds) && documentIds.length > 0) {
      await meeting.setDocuments(documentIds);
    }

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
        },
        {
          model: Document,
          as: 'documents',
          attributes: ['id', 'fileName']
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

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: ' + error.errors.map(e => e.message).join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create meeting: ' + error.message
    });
  }
};

// Update meeting status
exports.updateMeetingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status, notes, rating, feedback,
      finalFee, engagementScope, engagementNotes,
      deliverables, milestones, pendingStatus, nextFollowUp
    } = req.body;

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
    if (finalFee) updateData.finalFee = finalFee;
    if (engagementScope) updateData.engagementScope = engagementScope;
    if (engagementNotes) updateData.engagementNotes = engagementNotes;
    if (deliverables) updateData.deliverables = deliverables;
    if (milestones) updateData.milestones = milestones;
    if (pendingStatus) updateData.pendingStatus = pendingStatus;
    if (nextFollowUp) updateData.nextFollowUp = nextFollowUp;

    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    await meeting.update(updateData);

    // Step 7: Real-time Change Log
    await ActivityLog.create({
      userId: req.user.id,
      meetingId: meeting.id,
      action: status === 'completed' ? 'CASE_FORMALIZED' : 'STATUS_CHANGE',
      description: status === 'completed'
        ? `Case formalized with fee ₹${updateData.finalFee || 'N/A'}`
        : `Consultation status changed to ${status}`,
      metadata: { status, finalFee: updateData.finalFee, engagementScope: updateData.engagementScope }
    });

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

    // Use actual Zoom API to create meeting
    const zoomDetails = await zoomService.createMeeting(
      meeting.title || 'Financial Consultation',
      meeting.startsAt.toISOString(),
      Math.round((new Date(meeting.endsAt) - new Date(meeting.startsAt)) / 60000)
    );

    const updateData = {
      zoomMeetingId: zoomDetails.id.toString(),
      zoomJoinUrl: zoomDetails.joinUrl,
      zoomStartUrl: zoomDetails.startUrl,
      zoomPassword: zoomDetails.password
    };

    await meeting.update(updateData);

    res.json({
      success: true,
      zoomDetails,
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