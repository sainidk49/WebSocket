const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, },
  email: { type: String, required: true, unique: true },
  otp: { type: String },
  profile: { type: String, default: 'https://img.freepik.com/free-vector/user-blue-gradient_78370-4692.jpg' },
  description: { type: String, default: "Hi there! I'm using this app." },
  socketId: { type: String, default: null },
  isOnline: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
