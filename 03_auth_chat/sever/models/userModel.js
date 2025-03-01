const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, },
  email: { type: String, required: true, unique: true },
  otp: { type: String },
  socketId: { type: String, default: null },
  isVerified: { type: Boolean, default: false },
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
