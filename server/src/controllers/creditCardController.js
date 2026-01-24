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
    const {
      age,
      annualIncome,
      creditScore,
      employmentType,
      cardType,
      spendingCategories,
      monthlySpend,
      bankPreference,
      additionalFeatures
    } = userPreferences;

    // Fetch all active credit cards from database
    const allCards = await CreditCard.findAll();

    // Scoring logic
    const scoredCards = allCards.map(card => {
      let score = 0;
      let eligibilityScore = 0;
      let personalizedScore = 0;

      const cardRatings = card.ratings || {};
      const cardEligibility = card.eligibility || {};

      // 1. ELIGIBILITY SCORING (40% weight)
      const uAge = parseInt(age) || 25;
      const uIncome = parseFloat(annualIncome) || 300000;
      const uCreditScore = parseInt(creditScore) || 650;

      if (cardEligibility.min_age && uAge >= cardEligibility.min_age &&
        (!cardEligibility.max_age || uAge <= cardEligibility.max_age)) {
        eligibilityScore += 25;
      }

      if (cardEligibility.min_income && uIncome >= cardEligibility.min_income) {
        eligibilityScore += 25;
        if (uIncome > cardEligibility.min_income * 1.5) eligibilityScore += 10;
      }

      if (cardEligibility.credit_score_min && uCreditScore >= cardEligibility.credit_score_min) {
        eligibilityScore += 20;
        if (uCreditScore > cardEligibility.credit_score_min + 50) eligibilityScore += 10;
      }

      if (employmentType && cardEligibility.employment_type &&
        cardEligibility.employment_type.includes(employmentType)) {
        eligibilityScore += 10;
      }

      // 2. PERSONALIZED PREFERENCE SCORING (35% weight)
      if (spendingCategories && Array.isArray(spendingCategories)) {
        spendingCategories.forEach(category => {
          const categoryMapping = {
            groceries: 'shopping',
            dining: 'dining_entertainment',
            travel: 'travel',
            shopping: 'shopping',
            entertainment: 'dining_entertainment',
            fuel: 'fuel',
            bills: 'charges'
          };

          const mappedCategory = categoryMapping[category];
          if (cardRatings[mappedCategory]) {
            personalizedScore += cardRatings[mappedCategory] * 3;
          }
        });
      }

      if (cardType && Array.isArray(cardType)) {
        cardType.forEach(type => {
          if (card.type && card.type.toLowerCase() === type.toLowerCase()) {
            personalizedScore += 20;
          }
        });
      }

      if (bankPreference && Array.isArray(bankPreference)) {
        bankPreference.forEach(bank => {
          if (card.name && card.name.toLowerCase().includes(bank.toLowerCase())) {
            personalizedScore += 15;
          }
        });
      }

      // 3. SPENDING PATTERN ANALYSIS (15% weight)
      const uMonthlySpend = parseFloat(monthlySpend || 0);
      let spendingScore = 0;

      if (uMonthlySpend > 100000) {
        if (card.type === 'Premium') spendingScore += 25;
      } else if (uMonthlySpend > 50000) {
        if (card.type === 'Travel' || card.type === 'Rewards') spendingScore += 20;
      } else {
        if (card.type === 'Cashback' || card.annualFee === '0') spendingScore += 20;
      }

      // 4. FEATURE MATCHING (10% weight)
      let featureScore = 0;
      if (additionalFeatures && Array.isArray(additionalFeatures)) {
        additionalFeatures.forEach(feature => {
          const benefits = card.benefits;
          if (Array.isArray(benefits) && benefits.some(b => b.toLowerCase().includes(feature.toLowerCase()))) {
            featureScore += 8;
          }
        });
      }

      const totalScore = (eligibilityScore * 0.4) + (personalizedScore * 0.35) +
        (spendingScore * 0.15) + (featureScore * 0.1);

      return {
        ...card.toJSON(),
        score: totalScore,
        matchPercentage: Math.min(Math.round(totalScore), 100)
      };
    });

    const recommendations = scoredCards
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    res.json({
      success: true,
      message: 'Recommendations generated successfully',
      recommendations
    });
  } catch (error) {
    console.error('Credit card recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations: ' + error.message
    });
  }
};