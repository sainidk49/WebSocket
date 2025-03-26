const express = require('express');
const { 
    sendMessage, 
    getMessages, 
    getChatList, 
    getUnseenMessagesCount, 
    markMessagesAsSeen 
} = require('../controllers/chatController');

const router = express.Router();

router.post('/send', sendMessage);
router.get('/messages/:senderId/:receiverId', getMessages);
router.get('/list/:senderId', getChatList);
router.get('/unseen/:senderId/:receiverId', getUnseenMessagesCount);
router.get('/seen/:senderId/:receiverId', markMessagesAsSeen);

module.exports = router;
