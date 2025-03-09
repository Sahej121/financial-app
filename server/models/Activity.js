const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'userType',
    required: true
  },
  userType: {
    type: String,
    required: true,
    enum: ['Analyst', 'CA', 'Client']
  },
  type: {
    type: String,
    required: true,
    enum: [
      'CONSULTATION_SCHEDULED',
      'CONSULTATION_COMPLETED',
      'DOCUMENT_UPLOADED',
      'PAYMENT_RECEIVED',
      'CLIENT_ADDED',
      'STATUS_UPDATED',
      'COMMENT_ADDED',
      'TASK_COMPLETED'
    ]
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    consultationId: mongoose.Schema.Types.ObjectId,
    clientId: mongoose.Schema.Types.ObjectId,
    documentId: mongoose.Schema.Types.ObjectId,
    paymentId: mongoose.Schema.Types.ObjectId,
    amount: Number,
    status: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ userType: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema); 