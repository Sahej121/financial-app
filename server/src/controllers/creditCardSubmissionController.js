const { CreditCardSubmission, User } = require('../models');
const { Op } = require('sequelize');

// Submit credit card recommendation form
exports.submitCreditCardForm = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      // Personal Information
      fullName,
      email,
      phone,
      dateOfBirth,
      
      // Employment Information
      employmentType,
      monthlyIncome,
      workExperience,
      companyName,
      
      // Financial Information
      monthlySpend,
      existingCards,
      creditScore,
      
      // Card Preferences
      cardType,
      spendingCategories,
      bankPreference,
      additionalFeatures,
      
      // Financial Goals
      primaryPurpose,
      annualFeePreference,
      
      // Additional Information
      specialRequests,
      
      // Recommendations (if generated)
      recommendedCards,
      recommendationScore
    } = req.body;

    // Validation
    if (!fullName || !email || !phone || !employmentType || !monthlyIncome || !monthlySpend) {
      return res.status(400).json({
        success: false,
        error: 'Required fields missing: fullName, email, phone, employmentType, monthlyIncome, monthlySpend'
      });
    }

    // Create credit card submission
    const submission = await CreditCardSubmission.create({
      userId,
      fullName,
      email,
      phone,
      dateOfBirth: dateOfBirth || null,
      employmentType,
      monthlyIncome,
      workExperience: workExperience || null,
      companyName: companyName || null,
      monthlySpend,
      existingCards: existingCards || 0,
      creditScore: creditScore || null,
      cardType: cardType || null,
      spendingCategories: spendingCategories || null,
      bankPreference: bankPreference || null,
      additionalFeatures: additionalFeatures || null,
      primaryPurpose: primaryPurpose || null,
      annualFeePreference: annualFeePreference || null,
      recommendedCards: recommendedCards || null,
      recommendationScore: recommendationScore || null,
      specialRequests: specialRequests || null,
      status: recommendedCards ? 'recommendations_generated' : 'submitted'
    });

    console.log('Credit card submission created:', submission.id);

    res.status(201).json({
      success: true,
      message: 'Credit card form submitted successfully',
      submission: {
        id: submission.id,
        employmentType: submission.employmentType,
        monthlyIncome: submission.monthlyIncome,
        status: submission.status,
        createdAt: submission.createdAt
      }
    });

  } catch (error) {
    console.error('Credit card submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit credit card form: ' + error.message
    });
  }
};

// Get user's credit card submissions
exports.getUserSubmissions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const submissions = await CreditCardSubmission.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      attributes: [
        'id', 'employmentType', 'monthlyIncome', 'monthlySpend', 
        'cardType', 'status', 'recommendationScore', 'createdAt', 'updatedAt'
      ]
    });

    res.json({
      success: true,
      submissions
    });

  } catch (error) {
    console.error('Error fetching user credit card submissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch submissions: ' + error.message
    });
  }
};

// Get all credit card submissions (for admin)
exports.getAllSubmissions = async (req, res) => {
  try {
    const { status, employmentType, page = 1, limit = 10 } = req.query;
    
    const whereClause = {};
    if (status) whereClause.status = status;
    if (employmentType) whereClause.employmentType = employmentType;

    const offset = (page - 1) * limit;

    const { count, rows: submissions } = await CreditCardSubmission.findAndCountAll({
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
    console.error('Error fetching all credit card submissions:', error);
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
    const { status, appliedCards, notes } = req.body;

    const submission = await CreditCardSubmission.findByPk(id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    await submission.update({
      status: status || submission.status,
      appliedCards: appliedCards || submission.appliedCards,
      notes: notes || submission.notes
    });

    res.json({
      success: true,
      message: 'Submission updated successfully',
      submission
    });

  } catch (error) {
    console.error('Error updating credit card submission:', error);
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

    const submission = await CreditCardSubmission.findOne({
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
    console.error('Error fetching credit card submission details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch submission details: ' + error.message
    });
  }
};

// Update recommendations for a submission
exports.updateRecommendations = async (req, res) => {
  try {
    const { id } = req.params;
    const { recommendedCards, recommendationScore } = req.body;

    const submission = await CreditCardSubmission.findByPk(id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    await submission.update({
      recommendedCards,
      recommendationScore,
      status: 'recommendations_generated'
    });

    res.json({
      success: true,
      message: 'Recommendations updated successfully',
      submission
    });

  } catch (error) {
    console.error('Error updating recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update recommendations: ' + error.message
    });
  }
};

// Get analytics data for credit card submissions
exports.getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const whereClause = {};
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Get submission counts by status
    const statusCounts = await CreditCardSubmission.findAll({
      where: whereClause,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Get submission counts by employment type
    const employmentCounts = await CreditCardSubmission.findAll({
      where: whereClause,
      attributes: [
        'employmentType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['employmentType'],
      raw: true
    });

    // Get average monthly income
    const avgIncome = await CreditCardSubmission.findOne({
      where: whereClause,
      attributes: [
        [sequelize.fn('AVG', sequelize.col('monthlyIncome')), 'avgIncome']
      ],
      raw: true
    });

    res.json({
      success: true,
      analytics: {
        statusCounts,
        employmentCounts,
        avgIncome: avgIncome.avgIncome || 0
      }
    });

  } catch (error) {
    console.error('Error fetching credit card analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics: ' + error.message
    });
  }
}; 