const { FinancialPlanningSubmission, User } = require('../models');
const { Op } = require('sequelize');

// Submit financial planning form
exports.submitFinancialPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      // Basic Information
      fullName,
      email,
      phone,
      age,
      occupation,

      // Step 1: Goal (Legacy primaryGoal removed)
      targetAmount,
      targetTimeline,

      // Step 2: Time Horizon
      achievementTimeline,
      timelineFlexibility,

      // Step 3: Risk Profile
      riskReaction,
      investmentExperience,
      riskPreference,
      riskScore,

      // Step 4: Income
      incomeType,
      monthlyIncome,
      incomeStability,
      monthlySavings,

      // Step 5: Assets
      assets,

      // Step 6: Liabilities
      liabilities,
      totalLiabilityAmount,
      highestInterestRate,
      dependents,

      // Step 7: Protection
      hasHealthInsurance,
      hasLifeInsurance,
      medicalConditions,

      // Step 8: Tax
      taxResidency,
      taxBracket,
      existingTaxSavingInvestments,
      upcomingTaxEvents,

      // Step 9: Preferences
      avoidedInvestments,
      liquidityNeeds,
      ethicalPreferences,
      exposurePreference,

      // Step 11: Success
      successPriority,
      reviewFrequency,

      // Step 12: Summary/Output
      riskProfileSummary,
      netWorthSnapshot,
      gapsIdentified,
      strategyOutline,

      // Consultation
      consultationSlot,
      preferredMeetingType,
      documentIds // Extract documentIds
    } = req.body;

    // Validation (Legacy primaryGoal check removed)

    // Create financial planning submission
    // First, fetch the user's primary info if not provided in the request body
    const { User: U, Document } = require('../models');
    const userProfile = await U.findByPk(userId);

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

      // Goal (Legacy primaryGoal removed)
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
      existingTaxSavingInvestments: existingTaxSavingInvestments || null,
      upcomingTaxEvents: upcomingTaxEvents || null,

      // Preferences
      avoidedInvestments: avoidedInvestments || [],
      liquidityNeeds: liquidityNeeds || false,
      ethicalPreferences: ethicalPreferences || null,
      exposurePreference: exposurePreference || null,

      // Success
      successPriority: successPriority || null,
      reviewFrequency: reviewFrequency || null,

      // Summary
      riskProfileSummary: riskProfileSummary || null,
      netWorthSnapshot: netWorthSnapshot || {},
      gapsIdentified: gapsIdentified || [],
      strategyOutline: strategyOutline || null,

      consultationSlot: consultationSlot || null,
      preferredMeetingType: preferredMeetingType || null,
      status: 'submitted'
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

    // Create a meeting/consultation based on selected slot
    if (consultationSlot) {
      const { Meeting: M, FinancialPlanner } = require('../models');
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

      await M.create({
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
      // Console logic already logs full errors, so just return friendly message
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

    const { count, rows: submissions } = await FinancialPlanningSubmission.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      submissions,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
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

    await submission.update({
      status: status || submission.status,
      assignedAnalyst: assignedAnalyst || submission.assignedAnalyst,
      notes: notes || submission.notes
    });

    res.json({
      success: true,
      message: 'Submission updated successfully',
      submission
    });

  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update submission: ' + error.message
    });
  }
};

// Get submission details
exports.getSubmissionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const submission = await FinancialPlanningSubmission.findOne({
      where: { id, userId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
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