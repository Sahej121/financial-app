const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  planningType: {
    type: String,
    enum: ['business', 'loan', 'investment'],
    required: true,
  },
  documents: [{
    filename: String,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  consultationSlot: {
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    analyst: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Consultation', consultationSchema); 