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
      monthlyIncome,
      
      // Financial Goals
      planningType,
      goalDescription,
      targetAmount,
      timeframe,
      riskTolerance,
      
      // Business-specific fields
      businessType,
      currentRevenue,
      expansionGoal,
      
      // Loan-specific fields
      loanType,
      loanAmount,
      currentEMI,
      
      // Investment preferences
      investmentExperience,
      preferredInvestments,
      
      // Additional information
      existingInvestments,
      specialRequirements,
      
      // Consultation details
      consultationSlot,
      preferredMeetingType
    } = req.body;

    // Validation
    if (!fullName || !email || !phone || !planningType) {
      return res.status(400).json({
        success: false,
        error: 'Required fields missing: fullName, email, phone, planningType'
      });
    }

    // Create financial planning submission
    const submission = await FinancialPlanningSubmission.create({
      userId,
      fullName,
      email,
      phone,
      age: age || null,
      occupation: occupation || null,
      monthlyIncome: monthlyIncome || null,
      planningType,
      goalDescription: goalDescription || null,
      targetAmount: targetAmount || null,
      timeframe: timeframe || null,
      riskTolerance: riskTolerance || null,
      businessType: businessType || null,
      currentRevenue: currentRevenue || null,
      expansionGoal: expansionGoal || null,
      loanType: loanType || null,
      loanAmount: loanAmount || null,
      currentEMI: currentEMI || null,
      investmentExperience: investmentExperience || null,
      preferredInvestments: preferredInvestments || null,
      existingInvestments: existingInvestments || null,
      specialRequirements: specialRequirements || null,
      consultationSlot: consultationSlot || null,
      preferredMeetingType: preferredMeetingType || null,
      status: 'submitted'
    });

    console.log('Financial planning submission created:', submission.id);

    res.status(201).json({
      success: true,
      message: 'Financial planning form submitted successfully',
      submission: {
        id: submission.id,
        planningType: submission.planningType,
        status: submission.status,
        createdAt: submission.createdAt
      }
    });

  } catch (error) {
    console.error('Financial planning submission error:', error);
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
        'id', 'planningType', 'goalDescription', 'targetAmount', 
        'timeframe', 'status', 'assignedAnalyst', 'createdAt', 'updatedAt'
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
    const { status, planningType, page = 1, limit = 10 } = req.query;
    
    const whereClause = {};
    if (status) whereClause.status = status;
    if (planningType) whereClause.planningType = planningType;

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