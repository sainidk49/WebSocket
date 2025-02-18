const Chat = require('../models/chatModel');
const mongoose = require('mongoose');

const validateUserData = (data, requiredFields) => {
  for (let field of requiredFields) {
    if (!data[field]) {
      return { status: false, message: `${field} is required` };
    }
  }
  return { status: true };
};

// Send a message
const sendMessage = async (req, res) => {

  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ status: false, message: 'User data not provided!' });
    }

    const validation = validateUserData(req.body, ['senderId', 'receiverId', "content"]);
    if (!validation.status) {
      return res.status(400).json(validation);
    }

    const { senderId, receiverId, content } = req.body

    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({ status: false, message: 'Invalid senderId' });
    }
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ status: false, message: 'Invalid receiverId' });
    }

    const message = new Chat({
      senderId: new mongoose.Types.ObjectId(senderId),
      receiverId: new mongoose.Types.ObjectId(receiverId),
      content,
    });


    await message.save();
    res.status(200).json({ status: true, message: 'Message sent' });

  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// Get messages between users
const getMessages = async (req, res) => {
  const { senderId, receiverId } = req.params;
  if (!senderId) {
    return res.status(400).json({ status: false, message: 'Sender ID is required' });
  }
  else if (!receiverId) {
    return res.status(400).json({ status: false, message: 'Receiver ID is required' });
  }

  try {
    const messages = await Chat.find({ senderId, receiverId }).sort({ timestamp: 1 });
    
    res.status(200).json({ status: true, messages });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

module.exports = { sendMessage, getMessages };
