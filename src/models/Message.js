import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
	{
		conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
		sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		content: { type: String, required: true },
		messageType: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
		attachments: [{ type: String }], // URLs to uploaded files
		isRead: { type: Boolean, default: false },
		readAt: { type: Date }
	},
	{ timestamps: true }
);

export default mongoose.model('Message', messageSchema);
