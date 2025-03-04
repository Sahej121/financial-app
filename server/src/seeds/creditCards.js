const CreditCard = require('../models/CreditCard');

const creditCards = [
  {
    name: "Rewards Plus Card",
    type: "Rewards",
    provider: "HDFC Bank",
    annualFee: 1000,
    rewardRate: "4X points on shopping",
    welcomeOffer: "10,000 bonus points",
    minIncomeRequired: 300000,
    benefits: [
      "4X reward points on shopping",
      "1% fuel surcharge waiver",
      "Movie ticket discounts",
      "Airport lounge access"
    ],
    rating: 4.5,
    reviewCount: 1250
  },
  // Add more credit cards...
];

const seedCreditCards = async () => {
  try {
    await CreditCard.deleteMany({});
    await CreditCard.insertMany(creditCards);
    console.log('Credit cards seeded successfully');
  } catch (error) {
    console.error('Error seeding credit cards:', error);
  }
};

module.exports = seedCreditCards; 