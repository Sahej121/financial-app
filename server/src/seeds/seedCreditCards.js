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
      await CreditCard.create({
        name: card.name,
        annualFee: card.annual_charges,
        hiddenCharges: card.hidden_charges,
        keyBenefits: card.key_benefits,
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