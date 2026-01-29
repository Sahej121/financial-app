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
const DocumentInsight = require('./DocumentInsight');
const FinancialPlanner = require('./financialPlanner');
const ActivityLog = require('./activityLog');
// GST Models
const GSTProfile = require('./GSTProfile');
const GSTInvoice = require('./GSTInvoice');
const GSTFiling = require('./GSTFiling');
const HSNCode = require('./HSNCode');
const ITCRecord = require('./ITCRecord');

// Initialize models
const models = {
  User: User(sequelize),
  CA: CA(sequelize),
  Document: Document(sequelize),
  Meeting: Meeting(sequelize),
  CreditCard: CreditCard(sequelize),
  CreditCardApplication: CreditCardApplication(sequelize),
  FinancialPlanningSubmission: FinancialPlanningSubmission(sequelize),
  CreditCardSubmission: CreditCardSubmission(sequelize),
  DocumentInsight: DocumentInsight(sequelize),
  FinancialPlanner: FinancialPlanner(sequelize),
  ActivityLog: ActivityLog(sequelize),
  // GST Models
  GSTProfile: GSTProfile(sequelize),
  GSTInvoice: GSTInvoice(sequelize),
  GSTFiling: GSTFiling(sequelize),
  HSNCode: HSNCode(sequelize),
  ITCRecord: ITCRecord(sequelize)
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