const mongoose = require('mongoose');

const financialDataSchema = new mongoose.Schema({
  consultationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    required: true
  },
  dataPoints: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    income: Number,
    expenses: [{
      category: String,
      amount: Number
    }],
    savings: Number,
    investments: [{
      type: String,
      amount: Number
    }],
    loans: [{
      type: String,
      amount: Number,
      interestRate: Number
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FinancialData', financialDataSchema); 