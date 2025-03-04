const CreditCard = require('../models/CreditCard');

exports.getRecommendations = async (req, res) => {
  try {
    const { annualIncome, cardType, purpose, name, age, email, phone } = req.query;

    let query = {};

    // Filter by minimum income
    if (annualIncome) {
      query.minIncomeRequired = { $lte: Number(annualIncome) };
    }

    // Filter by card type
    if (cardType) {
      query.type = cardType;
    }

    const cards = await CreditCard.find(query)
      .sort({ rating: -1 })
      .limit(10);

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