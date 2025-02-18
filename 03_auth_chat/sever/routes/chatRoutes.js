const express = require('express');
const { sendMessage, getMessages } = require('../controllers/chatController');

const router = express.Router();

router.post('/send', sendMessage);
router.get('/messages/:senderId/:receiverId', getMessages);

module.exports = router;
