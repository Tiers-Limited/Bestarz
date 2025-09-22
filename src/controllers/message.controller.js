const Message = require('../models/Message.js');
const Conversation = require('../models/Conversation.js');
const User = require('../models/User.js');
const Booking = require('../models/Booking.js');

 const getConversations = async (req, res) => {
	try {
		const userId = req.user.id;
		const { page = 1, limit = 20 } = req.query;
		
		const conversations = await Conversation.find({
			participants: userId,
			isActive: true
		})
		.populate([
			{ path: 'participants', select: 'firstName lastName profileImage' },
			{ path: 'lastMessage', select: 'content createdAt' },
			{ path: 'booking', select: 'serviceCategory eventType' }
		])
		.sort({ lastMessageAt: -1 })
		.skip((Number(page) - 1) * Number(limit))
		.limit(Number(limit));
		
		const total = await Conversation.countDocuments({
			participants: userId,
			isActive: true
		});
		
		return res.json({
			conversations,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total,
				pages: Math.ceil(total / Number(limit))
			}
		});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

 const getConversation = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;
		
		const conversation = await Conversation.findById(id)
			.populate([
				{ path: 'participants', select: 'firstName lastName profileImage email phone' },
				{ path: 'booking', select: 'serviceCategory eventType dateStart location' }
			]);
		
		if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
		
		// Check if user is participant
		const isParticipant = conversation.participants.some(p => String(p._id) === String(userId));
		if (!isParticipant && req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Forbidden' });
		}
		
		return res.json({ conversation });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

 const getMessages = async (req, res) => {
	try {
		const { conversationId } = req.params;
		const { page = 1, limit = 50 } = req.query;
		const userId = req.user.id;
		
		// Check if user has access to conversation
		const conversation = await Conversation.findById(conversationId);
		if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
		
		const isParticipant = conversation.participants.some(p => String(p) === String(userId));
		if (!isParticipant && req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Forbidden' });
		}
		
		const messages = await Message.find({ conversation: conversationId })
			.populate('sender', 'firstName lastName profileImage')
			.sort({ createdAt: -1 })
			.skip((Number(page) - 1) * Number(limit))
			.limit(Number(limit));
		
		const total = await Message.countDocuments({ conversation: conversationId });
		
		// Mark messages as read
		await Message.updateMany(
			{ 
				conversation: conversationId, 
				sender: { $ne: userId },
				isRead: false 
			},
			{ 
				isRead: true, 
				readAt: new Date() 
			}
		);
		
		return res.json({
			messages: messages.reverse(), // Return in chronological order
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total,
				pages: Math.ceil(total / Number(limit))
			}
		});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

 const sendMessage = async (req, res) => {
	try {
		const { conversationId } = req.params;
		const { content, messageType = 'text', attachments = [] } = req.body;
		const userId = req.user.id;
		
		// Check if user has access to conversation
		const conversation = await Conversation.findById(conversationId);
		if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
		
		const isParticipant = conversation.participants.some(p => String(p) === String(userId));
		if (!isParticipant && req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Forbidden' });
		}
		
		const message = await Message.create({
			conversation: conversationId,
			sender: userId,
			content,
			messageType,
			attachments
		});
		
		// Update conversation last message
		conversation.lastMessage = message._id;
		conversation.lastMessageAt = new Date();
		
		// Update unread count for other participants
		conversation.participants.forEach(participantId => {
			if (String(participantId) !== String(userId)) {
				const currentCount = conversation.unreadCount.get(String(participantId)) || 0;
				conversation.unreadCount.set(String(participantId), currentCount + 1);
			}
		});
		
		await conversation.save();
		
		await message.populate('sender', 'firstName lastName profileImage');
		
		return res.status(201).json({ message });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

 const createConversation = async (req, res) => {
	try {
		const { participantId, bookingId, title } = req.body;
		const userId = req.user.id;
		
		// Check if participant exists
		const participant = await User.findById(participantId);
		if (!participant) return res.status(404).json({ message: 'Participant not found' });
		
		// Check if booking exists (if provided)
		let booking = null;
		if (bookingId) {
			booking = await Booking.findById(bookingId);
			if (!booking) return res.status(404).json({ message: 'Booking not found' });
		}
		
		// Check if conversation already exists
		const existingConversation = await Conversation.findOne({
			participants: { $all: [userId, participantId] },
			isActive: true
		});
		
		if (existingConversation) {
			return res.json({ conversation: existingConversation });
		}
		
		const conversation = await Conversation.create({
			participants: [userId, participantId],
			booking: bookingId,
			title: title || `${participant.firstName} ${participant.lastName}`
		});
		
		await conversation.populate([
			{ path: 'participants', select: 'firstName lastName profileImage email phone' },
			{ path: 'booking', select: 'serviceCategory eventType dateStart location' }
		]);
		
		return res.status(201).json({ conversation });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

 const markAsRead = async (req, res) => {
	try {
		const { conversationId } = req.params;
		const userId = req.user.id;
		
		// Check if user has access to conversation
		const conversation = await Conversation.findById(conversationId);
		if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
		
		const isParticipant = conversation.participants.some(p => String(p) === String(userId));
		if (!isParticipant && req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Forbidden' });
		}
		
		// Mark all messages in conversation as read
		await Message.updateMany(
			{ 
				conversation: conversationId, 
				sender: { $ne: userId },
				isRead: false 
			},
			{ 
				isRead: true, 
				readAt: new Date() 
			}
		);
		
		// Reset unread count for this user
		conversation.unreadCount.set(String(userId), 0);
		await conversation.save();
		
		return res.json({ message: 'Messages marked as read' });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

 const getUnreadCount = async (req, res) => {
	try {
		const userId = req.user.id;
		
		const conversations = await Conversation.find({
			participants: userId,
			isActive: true
		});
		
		let totalUnread = 0;
		conversations.forEach(conversation => {
			const unreadCount = conversation.unreadCount.get(String(userId)) || 0;
			totalUnread += unreadCount;
		});
		
		return res.json({ unreadCount: totalUnread });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};
module.exports = {
    getConversations,
    getConversation,
    getMessages,
    sendMessage,
    createConversation,
    markAsRead,
    getUnreadCount
};
