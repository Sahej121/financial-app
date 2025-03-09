const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // ... existing fields ...
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  googleId: String,
  facebookId: String,
  provider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local'
  }
});

module.exports = mongoose.model('User', userSchema);
