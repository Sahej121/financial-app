const { CreditCard, CreditCardApplication } = require('../models');
const { Op } = require('sequelize');
const express = require('express');

exports.getRecommendations = async (req, res) => {
  try {
    const { annualIncome, cardType, purpose, name, age, email, phone } = req.query;

    let whereClause = {};

    // Filter by minimum income
    if (annualIncome) {
      whereClause.minIncomeRequired = {
        [Op.lte]: Number(annualIncome)
      };
    }

    // Filter by card type
    if (cardType) {
      whereClause.type = cardType;
    }

    const cards = await CreditCard.findAll({
      where: whereClause,
      order: [['rating', 'DESC']],
      limit: 10
    });

    // Store user details for future reference
    const userDetails = {
      name,
      age: parseInt(age),
      email,
      phone,
      annualIncome: parseFloat(annualIncome)
    };

    // You might want to store these details or use them for personalization

    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.applyForCard = async (req, res) => {
  try {
    const { cardId, name, email, phone, pan, dob, address, city, pincode } = req.body;
    const userId = req.user.id;

    // Create application record in database
    const application = await CreditCardApplication.create({
      userId,
      cardId,
      name,
      email,
      phone,
      pan,
      dob,
      address,
      city,
      pincode,
      status: 'pending'
    });

    // Send email notification
    // TODO: Implement email notification

    res.status(201).json({
      message: 'Application submitted successfully',
      applicationId: application.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Handle credit card feedback/requests from users
exports.submitCardFeedback = async (req, res) => {
  try {
    const { cardName, bankName, reason, contactInfo } = req.body;
    
    // In a real application, you would save this to a database
    // For now, we'll just log it and send a success response
    console.log('Credit Card Feedback Received:', {
      cardName,
      bankName,
      reason,
      contactInfo,
      timestamp: new Date(),
      userAgent: req.get('User-Agent')
    });
    
    // You could also send an email notification to the team here
    // await emailService.sendCardRequest({ cardName, bankName, reason, contactInfo });
    
    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Our team will review and add the card to our database.',
      data: {
        cardName,
        bankName,
        status: 'received'
      }
    });
  } catch (error) {
    console.error('Credit card feedback submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback. Please try again.'
    });
  }
};

// Get credit card recommendations (enhanced version)
exports.getCreditCardRecommendations = async (req, res) => {
  try {
    const userPreferences = req.body;
    
    // This would typically use your recommendation algorithm
    // For now, return a success response
    res.json({
      success: true,
      message: 'Recommendations generated successfully',
      recommendations: [] // This would be populated by your algorithm
    });
  } catch (error) {
    console.error('Credit card recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations'
    });
  }
}; 