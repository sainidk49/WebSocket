const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String },
  isSeen: { type: Boolean, default: false },
  isGroup: { type: Boolean, default: false },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
}, {
  timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema, "chat");
