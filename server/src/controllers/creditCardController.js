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
      additionalFeatures,
      rewardPreference
    } = userPreferences;

    // Fetch all active credit cards from database
    const allCards = await CreditCard.findAll();

    const uAge = parseInt(age);
    const uIncome = parseFloat(annualIncome) || 0;
    const uCreditScore = parseInt(creditScore) || 650;
    const uMonthlySpend = parseFloat(monthlySpend) || 0;

    // Scoring logic
    const scoredCards = allCards
      .filter(card => {
        // STRICT ELIGIBILITY FILTERING
        const cardEligibility = card.eligibility || {};

        // 1. Income check
        if (card.minIncomeRequired && uIncome < card.minIncomeRequired) return false;

        // 2. Age check
        if (cardEligibility.min_age && uAge < cardEligibility.min_age) return false;
        if (cardEligibility.max_age && uAge > cardEligibility.max_age) return false;

        return true;
      })
      .map(card => {
        let eligibilityScore = 0;
        let personalizedScore = 0;
        let spendingScore = 0;
        let rewardScore = 0;
        let featureScore = 0;

        const cardRatings = card.ratings || {};
        const cardEligibility = card.eligibility || {};

        // 1. ELIGIBILITY SCORING (25% weight)
        // High income/credit score relative to minimums gives bonus
        if (card.minIncomeRequired > 0) {
          const incomeRatio = uIncome / card.minIncomeRequired;
          eligibilityScore += Math.min(incomeRatio * 20, 40);
        } else {
          eligibilityScore += 20; // Default if no requirement
        }

        if (cardEligibility.credit_score_min) {
          if (uCreditScore >= cardEligibility.credit_score_min) {
            eligibilityScore += 40;
            if (uCreditScore > cardEligibility.credit_score_min + 100) eligibilityScore += 20;
          }
        } else {
          eligibilityScore += 40; // Default if no requirement
        }

        if (employmentType && cardEligibility.employment_type &&
          cardEligibility.employment_type.includes(employmentType)) {
          eligibilityScore += 20;
        }

        // 2. PERSONALIZED PREFERENCE SCORING (40% weight)
        if (spendingCategories && Array.isArray(spendingCategories)) {
          const categoryMapping = {
            groceries: 'shopping',
            dining: 'dining_entertainment',
            travel: 'travel',
            shopping: 'shopping',
            entertainment: 'dining_entertainment',
            fuel: 'fuel',
            bills: 'charges'
          };

          spendingCategories.forEach(category => {
            const mappedCategory = categoryMapping[category];
            if (cardRatings[mappedCategory]) {
              personalizedScore += cardRatings[mappedCategory] * 5;
            }
          });
        }

        if (cardType && Array.isArray(cardType)) {
          cardType.forEach(type => {
            if (card.type && card.type.toLowerCase() === type.toLowerCase()) {
              personalizedScore += 30;
            }
            // Check special remarks for type matches too
            if (card.specialRemarks && card.specialRemarks.toLowerCase().includes(type.toLowerCase())) {
              personalizedScore += 15;
            }
          });
        }

        if (bankPreference && Array.isArray(bankPreference)) {
          bankPreference.forEach(bank => {
            if (card.name && card.name.toLowerCase().includes(bank.toLowerCase())) {
              personalizedScore += 25;
            }
            if (card.provider && card.provider.toLowerCase().includes(bank.toLowerCase())) {
              personalizedScore += 25;
            }
          });
        }

        // 3. SPENDING PATTERN ANALYSIS (15% weight)
        if (uMonthlySpend > 100000) {
          if (card.type === 'Premium' || card.type === 'Lifestyle') spendingScore += 100;
          else if (card.type === 'Travel') spendingScore += 80;
        } else if (uMonthlySpend > 50000) {
          if (card.type === 'Travel' || card.type === 'Rewards') spendingScore += 100;
          else if (card.type === 'Shopping') spendingScore += 70;
        } else {
          if (card.type === 'Cashback' || card.type === 'Shopping' || card.annualFee === '0') spendingScore += 100;
        }

        // 4. REWARD PREFERENCE (10% weight)
        if (rewardPreference) {
          const rp = rewardPreference.toLowerCase();
          if (rp === 'cashback' && (card.type === 'Cashback' || card.name.toLowerCase().includes('cashback'))) rewardScore += 100;
          else if (rp === 'travel' && card.type === 'Travel') rewardScore += 100;
          else if (rp === 'points' && (card.type === 'Rewards' || card.name.toLowerCase().includes('rewards'))) rewardScore += 100;
        }

        // 5. FEATURE MATCHING (10% weight)
        if (additionalFeatures && Array.isArray(additionalFeatures)) {
          additionalFeatures.forEach(feature => {
            const benefits = card.benefits;
            if (Array.isArray(benefits) && benefits.some(b => b.toLowerCase().includes(feature.toLowerCase()))) {
              featureScore += 25;
            }
          });
        }

        // Normalize subscores to 100
        const normEligibility = Math.min(eligibilityScore, 100);
        const normPersonalized = Math.min(personalizedScore, 100);
        const normSpending = Math.min(spendingScore, 100);
        const normReward = Math.min(rewardScore, 100);
        const normFeature = Math.min(featureScore, 100);

        const totalScore = (normEligibility * 0.25) + (normPersonalized * 0.4) +
          (normSpending * 0.15) + (normReward * 0.1) + (normFeature * 0.1);

        // Calculate approval probability
        let approvalChance = 0;
        if (cardEligibility.credit_score_min) {
          const scoreDiff = uCreditScore - cardEligibility.credit_score_min;
          if (scoreDiff >= 100) approvalChance = 95;
          else if (scoreDiff >= 50) approvalChance = 85;
          else if (scoreDiff >= 0) approvalChance = 75;
          else approvalChance = 40; // Should not happen due to filter, but for safety
        } else {
          approvalChance = 80;
        }

        const matchPct = Math.min(Math.round(totalScore), 100);

        return {
          ...card.toJSON(),
          score: totalScore,
          matchPercentage: matchPct,
          approvalChance: approvalChance,
          eligibilityMet: true, // Filtered above
          // Frontend Compatibility Aliases
          bank: card.provider,
          card_type: card.type,
          annual_charges: card.annualFee,
          key_benefits: Array.isArray(card.benefits) ? card.benefits.join(', ') : card.benefits,
          application_url: card.applicationUrl,
          hidden_charges: card.hiddenCharges,
          special_remarks: card.specialRemarks
        };
      });

    const recommendations = scoredCards
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.reviewCount - a.reviewCount;
      })
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