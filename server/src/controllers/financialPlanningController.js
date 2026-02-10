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
const decisionPackService = require('../services/decisionPackService');
const { Op } = require('sequelize');
const { parseIndianCurrency } = require('../utils/currencyHelper');

// Submit financial planning form
exports.submitFinancialPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const body = req.body;

    // Sanitize numeric fields that might have "Lakh/Cr" suffixes
    const sanitizedTargetAmount = parseIndianCurrency(body.targetAmount);
    const sanitizedMonthlySavings = parseIndianCurrency(body.monthlySavings);
    const sanitizedTotalLiabilityAmount = parseIndianCurrency(body.totalLiabilityAmount);

    // Additional sanitization for MOAT fields
    const sanitizedFundingRequired = parseIndianCurrency(body.fundingRequired);
    const sanitizedAnnualRevenue = parseIndianCurrency(body.annualRevenue);
    const sanitizedTotalDebtAmount = parseIndianCurrency(body.totalDebtAmount);
    const sanitizedMonthlyEMI = parseIndianCurrency(body.monthlyEMI);
    const sanitizedMonthlyExpenses = parseIndianCurrency(body.monthlyExpenses);
    const sanitizedMonthlyIncome = parseIndianCurrency(body.monthlyIncome);

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

      // ... other fields (omitted for brevity in replace tool matches)
      // I will use a larger match to ensure context
      expansionType: expansionType || null,
      fundingRequired: sanitizedFundingRequired,
      expansionTimeline: expansionTimeline || null,
      businessType: businessType || null,
      industryType: industryType || null,
      annualRevenue: sanitizedAnnualRevenue,
      employeeCount: employeeCount || null,
      profitMargin: profitMargin || null,
      cashReserves: cashReserves || null,
      existingLoans: existingLoans || null,

      // MOAT: Loan Settlement
      debtTypes: debtTypes || null,
      totalDebtAmount: sanitizedTotalDebtAmount,
      monthlyEMI: sanitizedMonthlyEMI,
      monthlyExpenses: sanitizedMonthlyExpenses,
      settlementGoal: settlementGoal || null,
      settlementTimeline: settlementTimeline || null,

      // Goal
      targetAmount: sanitizedTargetAmount,
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
      monthlyIncome: sanitizedMonthlyIncome,
      incomeStability: incomeStability || null,
      monthlySavings: sanitizedMonthlySavings,

      // Assets
      assets: assets || {},

      // Liabilities
      liabilities: liabilities || [],
      totalLiabilityAmount: sanitizedTotalLiabilityAmount,
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

    // GENERATE SCORES IMMEDIATELY for instant UI feedback
    const scoringService = require('../services/scoringService');
    await scoringService.generateAllScores(submission.id).catch(err => console.error('Immediate scoring error:', err));

    console.log('Financial planning submission created:', submission.id);

    if (documentIds && Array.isArray(documentIds) && documentIds.length > 0) {
      console.log(`[DEBUG] Linking ${documentIds.length} documents to submission ${submission.id}`);
      console.log(`[DEBUG] Document IDs: ${documentIds.join(', ')}`);
      console.log(`[DEBUG] User ID: ${userId}`);

      const [updatedCount] = await Document.update(
        { submissionId: submission.id },
        {
          where: {
            id: { [Op.in]: documentIds },
            userId: userId // Security check: Ensure user owns documents
          }
        }
      ).catch(err => {
        console.error('[ERROR] Failed to link documents:', err);
        throw err;
      });
      console.log(`[DEBUG] Successfully linked ${updatedCount} documents`);
    } else {
      console.log('[DEBUG] No document IDs provided to link');
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

    // Trigger AI Decision Pack Generation (Async)
    decisionPackService.generatePack(submission.id)
      .then(pack => console.log(`Decision Pack generated for submission ${submission.id}`))
      .catch(err => console.error(`Decision Pack generation failed for ${submission.id}:`, err));

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

    // Send email notification
    if (status === 'consultation_scheduled' || status === 'completed') {
      const sendEmail = require('../utils/email');
      const subject = status === 'completed' ? 'Financial Plan Ready' : 'Consultation Scheduled';
      const message = status === 'completed'
        ? `Dear User,\n\nYour financial plan is ready! Please log in to your dashboard to view the decision pack.\n\nRegards,\nNeurona Team`
        : `Dear User,\n\nYour consultation has been actively scheduled. An analyst will contact you shortly.\n\nRegards,\nNeurona Team`;

      // Use submission email if available, or fetch user
      const recipientEmail = submission.email || (await submission.getUser())?.email;

      if (recipientEmail) {
        await sendEmail({
          email: recipientEmail,
          subject: subject,
          message: message
        });
      }
    }

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