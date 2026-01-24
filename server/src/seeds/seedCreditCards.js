const { sequelize, CreditCard } = require('../models');
const creditCards = require('./creditCards');
require('dotenv').config();

async function seedCreditCards() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Connected to SQLite database for seeding');

    // Sync models to ensure tables exist
    await sequelize.sync();

    // Clear existing data
    await CreditCard.destroy({ where: {}, truncate: true });

    // Insert new data
    for (const card of creditCards) {
      // Basic inference for provider and type
      const provider = card.name.split(' ')[0] || 'Generic';
      let type = 'Shopping';
      if (card.name.toLowerCase().includes('travel') || card.name.toLowerCase().includes('airline')) {
        type = 'Travel';
      } else if (card.name.toLowerCase().includes('reward')) {
        type = 'Rewards';
      } else if (card.name.toLowerCase().includes('fuel')) {
        type = 'Fuel';
      } else if (card.name.toLowerCase().includes('dining') || card.name.toLowerCase().includes('entertainment')) {
        type = 'Lifestyle';
      }

      await CreditCard.create({
        name: card.name,
        type: type,
        provider: provider,
        annualFee: card.annual_charges,
        benefits: card.benefits,
        ratings: card.ratings,
        welcomeOffer: card.welcomeOffer,
        specialRemarks: card.special_remarks
      });
    }

    console.log('Credit cards seeded successfully');
  } catch (error) {
    console.error('Error seeding credit cards:', error);
  } finally {
    await sequelize.close();
  }
}

seedCreditCards(); 