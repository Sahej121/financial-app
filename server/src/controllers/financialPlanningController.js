/**
 * Financial Planning Controller
 * Handles logic for financial blueprint wizard
 */

const {
  User,
  FinancialPlanningSubmission,
  FinancialPlanner,
  Meeting,
  Document
} = require('../models');
const { Op } = require('sequelize');

// Submit financial planning form
exports.submitFinancialPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      // Step 0: Purpose
      planningPurpose,

      // Step 1: Personal Details
      fullName,
      email,
      phone,
      age,
      occupation,

      // Step 2 expansion/loan fields
      expansionType,
      fundingRequired,
      expansionTimeline,
      businessType,
      industryType,
      annualRevenue,
      employeeCount,
      profitMargin,
      cashReserves,
      existingLoans,

      debtTypes,
      totalDebtAmount,
      monthlyEMI,
      monthlyExpenses,
      settlementGoal,
      settlementTimeline,

      // Investment fields
      targetAmount,
      targetTimeline,
      achievementTimeline,
      timelineFlexibility,

      // Risk
      riskReaction,
      investmentExperience,
      riskPreference,
      riskScore,

      // Income
      incomeType,
      monthlyIncome,
      incomeStability,
      monthlySavings,

      // Assets
      assets,

      // Liabilities
      liabilities,
      totalLiabilityAmount,
      highestInterestRate,
      dependents,

      // Protection
      hasHealthInsurance,
      hasLifeInsurance,
      medicalConditions,

      taxResidency,
      taxBracket,
      existingTaxSavingInvestments,
      upcomingTaxEvents,

      avoidedInvestments,
      liquidityNeeds,
      ethicalPreferences,
      exposurePreference,
      successPriority,
      reviewFrequency,

      consultationSlot, // Optional meeting slot
      preferredMeetingType,
      documentIds // Array of document IDs to link
    } = req.body;

    // Create financial planning submission
    // First, fetch the user's primary info if not provided in the request body
    const userProfile = await User.findByPk(userId);

    const finalFullName = fullName || userProfile?.name || 'Unknown User';
    const finalEmail = email || userProfile?.email || '';
    const finalPhone = phone || userProfile?.phone || '';

    const submission = await FinancialPlanningSubmission.create({
      userId,
      fullName: finalFullName,
      email: finalEmail,
      phone: finalPhone,
      age: age || null,
      occupation: occupation || null,

      // MOAT: Planning Purpose
      planningPurpose: planningPurpose || null,

      // MOAT: Business Expansion
      expansionType: expansionType || null,
      fundingRequired: fundingRequired || null,
      expansionTimeline: expansionTimeline || null,
      businessType: businessType || null,
      industryType: industryType || null,
      annualRevenue: annualRevenue || null,
      employeeCount: employeeCount || null,
      profitMargin: profitMargin || null,
      cashReserves: cashReserves || null,
      existingLoans: existingLoans || null,

      // MOAT: Loan Settlement
      debtTypes: debtTypes || null,
      totalDebtAmount: totalDebtAmount || null,
      monthlyEMI: monthlyEMI || null,
      monthlyExpenses: monthlyExpenses || null,
      settlementGoal: settlementGoal || null,
      settlementTimeline: settlementTimeline || null,

      // Goal
      targetAmount: targetAmount || null,
      targetTimeline: targetTimeline || null,

      // Time Horizon
      achievementTimeline: achievementTimeline || null,
      timelineFlexibility: timelineFlexibility || null,

      // Risk
      riskReaction: riskReaction || null,
      investmentExperience: investmentExperience || null,
      riskPreference: riskPreference || null,
      riskScore: riskScore || null,

      // Income
      incomeType: incomeType || null,
      monthlyIncome: monthlyIncome || null,
      incomeStability: incomeStability || null,
      monthlySavings: monthlySavings || null,

      // Assets
      assets: assets || {},

      // Liabilities
      liabilities: liabilities || [],
      totalLiabilityAmount: totalLiabilityAmount || null,
      highestInterestRate: highestInterestRate || null,
      dependents: dependents || null,

      // Protection
      hasHealthInsurance: hasHealthInsurance || false,
      hasLifeInsurance: hasLifeInsurance || false,
      medicalConditions: medicalConditions || null,

      // Tax
      taxResidency: taxResidency || null,
      taxBracket: taxBracket || null,
      existingTaxSavingInvestments: existingTaxSavingInvestments || [],
      upcomingTaxEvents: upcomingTaxEvents || null,

      // Preferences
      avoidedInvestments: avoidedInvestments || [],
      liquidityNeeds: liquidityNeeds || false,
      ethicalPreferences: ethicalPreferences || null,
      exposurePreference: exposurePreference || null,

      // Success Definition
      successPriority: successPriority || null,
      reviewFrequency: reviewFrequency || null,

      consultationSlot: consultationSlot || null,
      preferredMeetingType: preferredMeetingType || null,
      status: 'submitted',
      decisionPackStatus: 'pending'
    });

    console.log('Financial planning submission created:', submission.id);

    // Link uploaded documents to this submission
    if (documentIds && Array.isArray(documentIds) && documentIds.length > 0) {
      console.log('Linking documents:', documentIds);
      await Document.update(
        { submissionId: submission.id },
        {
          where: {
            id: { [Op.in]: documentIds },
            userId: userId // Security check: Ensure user owns documents
          }
        }
      ).catch(err => console.error('Error linking documents to submission:', err));
    }

    // Create a meeting/consultation based on selected slot IF provided
    // (Legacy support, though separate endpoint is preferred now)
    if (consultationSlot) {
      const startsAt = new Date(consultationSlot.date);

      // Parse time (supports formats like "10:00 AM", "2:00 PM", or "10:00")
      const timeStr = consultationSlot.time || '10:00 AM';
      const timeParts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (timeParts) {
        let hours = parseInt(timeParts[1]);
        const minutes = parseInt(timeParts[2]);
        const period = timeParts[3];

        if (period && period.toUpperCase() === 'PM' && hours !== 12) {
          hours += 12;
        } else if (period && period.toUpperCase() === 'AM' && hours === 12) {
          hours = 0;
        }
        startsAt.setHours(hours, minutes, 0, 0);
      }

      const endsAt = new Date(startsAt);
      endsAt.setHours(endsAt.getHours() + 1);

      // Get the selected planner's user ID or use the planner ID directly
      let professionalId = consultationSlot.plannerId;

      // If plannerId is provided, try to get the associated userId from FinancialPlanner
      if (professionalId) {
        try {
          const planner = await FinancialPlanner.findByPk(professionalId);
          if (planner && planner.userId) {
            professionalId = planner.userId;
          }
        } catch (err) {
          console.log('Could not find planner userId, using plannerId:', professionalId);
        }
      } else {
        // Fallback: get first active financial planner
        const firstPlanner = await FinancialPlanner.findOne({ where: { isActive: true } });
        professionalId = firstPlanner?.userId || firstPlanner?.id || 1;
      }

      const meetingTitle = 'Financial Consultation';

      await Meeting.create({
        clientId: userId,
        professionalId,
        professionalRole: 'financial_planner',
        title: meetingTitle,
        planningType: 'financial_planning', // Generic type for DB enum fit
        startsAt,
        endsAt,
        status: 'scheduled',
        submissionId: submission.id,
        clientNotes: `Risk Score: ${riskScore}.`
      }).catch(err => console.error('Auto-meeting creation error:', err));
    }

    res.status(201).json({
      success: true,
      message: 'Financial planning form submitted successfully',
      submission: {
        id: submission.id,
        status: submission.status,
        createdAt: submission.createdAt
      }
    });

  } catch (error) {
    console.error('Financial planning submission error:', error);

    // DEBUG LOGGING
    if (error.errors) {
      console.error('Full Error Errors:', JSON.stringify(error.errors, null, 2));
    }

    // Detailed validation error log
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const validationErrors = error.errors.map(e => `${e.path}: ${e.message}`);
      return res.status(400).json({
        success: false,
        error: 'Validation error: ' + validationErrors.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to submit financial planning form: ' + error.message
    });
  }
};

// Get user's financial planning submissions
exports.getUserSubmissions = async (req, res) => {
  try {
    const userId = req.user.id;

    const submissions = await FinancialPlanningSubmission.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      attributes: [
        'id', 'targetAmount',
        'targetTimeline', 'status', 'assignedAnalyst', 'createdAt', 'updatedAt'
      ]
    });

    res.json({
      success: true,
      submissions
    });

  } catch (error) {
    console.error('Error fetching user submissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch submissions: ' + error.message
    });
  }
};

// Get all submissions (for admin/analysts)
exports.getAllSubmissions = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const whereClause = {};
    if (status) whereClause.status = status;

    const offset = (page - 1) * limit;

    const { count, rows } = await FinancialPlanningSubmission.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      submissions: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching all submissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch submissions: ' + error.message
    });
  }
};

// Get single submission details
exports.getSubmissionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const submission = await FinancialPlanningSubmission.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    // Authorization check
    if (submission.userId !== userId && !['admin', 'financial_planner'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this submission'
      });
    }

    res.json({
      success: true,
      submission
    });

  } catch (error) {
    console.error('Error fetching submission details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch submission details: ' + error.message
    });
  }
};

// Update submission status
exports.updateSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedAnalyst, notes } = req.body;

    const submission = await FinancialPlanningSubmission.findByPk(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    const updates = {};
    if (status) updates.status = status;
    if (assignedAnalyst) updates.assignedAnalyst = assignedAnalyst;
    if (notes) updates.notes = notes;

    await submission.update(updates);

    // If status changed to 'consultation_scheduled' or 'completed', maybe notify user?
    // TODO: Add notification logic here

    res.json({
      success: true,
      message: 'Submission updated successfully',
      submission
    });

  } catch (error) {
    console.error('Error updating submission status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update status: ' + error.message
    });
  }
};

// Book consultation for existing submission
exports.bookConsultation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { submissionId, consultationSlot } = req.body;

    // Verify submission ownership
    const submission = await FinancialPlanningSubmission.findOne({
      where: { id: submissionId, userId }
    });

    if (!submission) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }

    if (!consultationSlot || !consultationSlot.date || !consultationSlot.time) {
      return res.status(400).json({ success: false, error: 'Invalid consultation slot' });
    }

    // Parse start time
    const startsAt = new Date(consultationSlot.date);
    const timeStr = consultationSlot.time || '10:00 AM';
    const timeParts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);

    if (timeParts) {
      let hours = parseInt(timeParts[1]);
      const minutes = parseInt(timeParts[2]);
      const period = timeParts[3];

      if (period && period.toUpperCase() === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period && period.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
      }
      startsAt.setHours(hours, minutes, 0, 0);
    }

    const endsAt = new Date(startsAt);
    endsAt.setHours(endsAt.getHours() + 1);

    // Get professional ID
    let professionalId = consultationSlot.plannerId;
    if (professionalId) {
      try {
        const planner = await FinancialPlanner.findByPk(professionalId);
        if (planner && planner.userId) {
          professionalId = planner.userId;
        }
      } catch (err) {
        console.log('Planner lookup failed, using ID directly');
      }
    } else {
      // Fallback
      const firstPlanner = await FinancialPlanner.findOne({ where: { isActive: true } });
      professionalId = firstPlanner?.userId || 1;
    }

    // Create meeting
    const meeting = await Meeting.create({
      clientId: userId,
      professionalId,
      professionalRole: 'financial_planner',
      title: 'Financial Consultation (Follow-up)',
      planningType: 'financial_planning',
      startsAt,
      endsAt,
      status: 'scheduled',
      submissionId: submission.id,
      clientNotes: `Booked after Insights review. Risk Score: ${submission.riskScore}.`
    });

    res.json({
      success: true,
      message: 'Consultation booked successfully',
      meeting
    });

  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};