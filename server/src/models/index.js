const { Sequelize } = require('sequelize');
const config = require('../config/database');
const path = require('path');

// Create Sequelize instance with SQLite
const sequelize = new Sequelize(config);

// Import models
const User = require('./user');
const CA = require('./ca');
const Document = require('./document');
const Meeting = require('./meeting');
const CreditCard = require('./CreditCard');
const CreditCardApplication = require('./CreditCardApplication');
const FinancialPlanningSubmission = require('./FinancialPlanningSubmission');
const CreditCardSubmission = require('./CreditCardSubmission');

// Initialize models
const models = {
  User: User(sequelize),
  CA: CA(sequelize),
  Document: Document(sequelize),
  Meeting: Meeting(sequelize),
  CreditCard: CreditCard(sequelize),
  CreditCardApplication: CreditCardApplication(sequelize),
  FinancialPlanningSubmission: FinancialPlanningSubmission(sequelize),
  CreditCardSubmission: CreditCardSubmission(sequelize)
};

// Set up associations
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models; 