const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
	{
		participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
		booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
		title: { type: String },
		lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
		lastMessageAt: { type: Date },
		isActive: { type: Boolean, default: true },
		unreadCount: { type: Map, of: Number, default: new Map() },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Conversation', conversationSchema);
