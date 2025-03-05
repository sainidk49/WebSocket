const Chat = require('../models/chatModel');
const User = require('../models/userModel');

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

    const { senderId, receiverId, content} = req.body

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
    const messages = await Chat.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ]
    }).sort({ timestamp: 1 });

    res.status(200).json({ status: true, messages });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};


// Get messages between users
const getChatList = async (req, res) => {
  try {
    const userId = req.params.senderId;

    // Find chats where the user is either sender or receiver
    const chats = await Chat.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    })
      .populate('senderId', 'name profile')
      .populate('receiverId', 'name profile')
      .sort({ updatedAt: -1 });

    // Format chat list
    const chatList = [];
    const uniqueUsers = new Set();

    chats.forEach(chat => {
      const otherUser = chat.senderId._id.toString() === userId ? chat.receiverId : chat.senderId;

      if (!uniqueUsers.has(otherUser._id.toString())) {
        uniqueUsers.add(otherUser._id.toString());
        chatList.push({
          userId: otherUser._id,
          userName: otherUser.name,
          profile: otherUser.profile,
          description: chat.description,
          lastMessage: chat.content,
          timestamp: chat.updatedAt,
        });
      }
    });

    res.status(200).json({ status: true, chats: chatList });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};


const getUnseenMessagesCount = async (req, res) => {
  try {
    const { receiverId, senderId } = req.params;
    // Count unseen messages where the user is the receiver
    const unseenCount = await Chat.countDocuments({
      senderId: receiverId, // receiver is the sender
      receiverId: senderId, // This is the user who is currently logged in
      isSeen: false
    });
    res.status(200).json({ status: true, unseenMessages: unseenCount });
  } catch (error) {
    console.error('Error fetching unseen messages count:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


const markMessagesAsSeen = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    await Chat.updateMany({
      senderId: receiverId,  // receiver is the sender
      receiverId: senderId,  // This is the user who is currently logged in
      isSeen: false
    },
      { $set: { isSeen: true } }
    );

    res.status(200).json({ message: 'Messages marked as seen' });
  } catch (error) {
    console.error('Error marking messages as seen:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { sendMessage, getMessages, getChatList, getUnseenMessagesCount, markMessagesAsSeen };
