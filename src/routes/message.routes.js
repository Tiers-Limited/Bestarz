const express = require('express');
const router = express.Router();

const {
	getConversations,
	getConversation,
	getMessages,
	sendMessage,
	createConversation,
	markAsRead,
	getUnreadCount
} = require('../controllers/message.controller.js');

const { auth } = require('../middleware/auth.js');

router.get('/conversations', auth(), getConversations);
router.get('/conversations/:id', auth(), getConversation);
router.get('/conversations/:conversationId/messages', auth(), getMessages);
router.post('/conversations', auth(), createConversation);
router.post('/conversations/:conversationId/messages', auth(), sendMessage);
router.get('/unread-count', auth(), getUnreadCount);
router.patch('/conversations/:conversationId/read', auth(), markAsRead);

module.exports = router;
