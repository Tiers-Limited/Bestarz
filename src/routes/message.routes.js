import { Router } from 'express';
import { 
	getConversations, 
	getConversation, 
	getMessages, 
	sendMessage, 
	createConversation, 
	markAsRead, 
	getUnreadCount 
} from '../controllers/message.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/conversations', auth(), getConversations);
router.get('/conversations/:id', auth(), getConversation);
router.get('/conversations/:conversationId/messages', auth(), getMessages);
router.post('/conversations', auth(), createConversation);
router.post('/conversations/:conversationId/messages', auth(), sendMessage);
router.get('/unread-count', auth(), getUnreadCount);
router.patch('/conversations/:conversationId/read', auth(), markAsRead);

export default router;
