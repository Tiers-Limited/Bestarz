import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import authRoutes from './routes/auth.routes.js';
import providerRoutes from './routes/provider.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import clientRoutes from './routes/client.routes.js'
import adminRoutes from './routes/admin.routes.js';
import reviewRoutes from './routes/review.routes.js';
import webhookRoutes from './routes/webhook.routes.js'
import messageRoutes from './routes/message.routes.js';
import supportRoutes from "./routes/supportRoutes.js";


const app = express();
const server = createServer(app);
// Socket.IO setup
const io = new Server(server, {
	cors: {
		origin: process.env.FRONTEND_URL || "http://localhost:3000",
		methods: ["GET", "POST"]
	}
});


console.log("Mongo URI:", process.env.MONGODB_URI);
console.log("PORT:", process.env.PORT);


app.use(cors({ origin: '*', credentials: false }));
app.use(helmet());



app.use((req, res, next) => {
	if (req.originalUrl .includes('webhook')) {
	  next();
	} else {
	  express.json({ limit: '10mb' })(req, res, next);
	}
  });
app.use(morgan('dev'));

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bestarz';
mongoose.set('strictQuery', true);
mongoose
	.connect(mongoUri)
	.then(() => {
		console.log('MongoDB connected');
	})
	.catch((err) => {
		console.error('MongoDB connection error:', err.message);
		process.exit(1);
	});

app.get('/api/health', (_req, res) => {
	res.json({ status: 'ok', service: 'bestarz-backend' });
});


// Socket.IO authentication middleware
io.use((socket, next) => {
	const token = socket.handshake.auth.token;
	if (!token) {
		return next(new Error('Authentication error'));
	}
	
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
		socket.userId = decoded.id;
		socket.userRole = decoded.role;
		next();
	} catch (err) {
		next(new Error('Authentication error'));
	}
});

// Socket.IO connection handling
io.on('connection', (socket) => {
	console.log(`User ${socket.userId} connected`);
	
	// Join user to their personal room
	socket.join(`user_${socket.userId}`);
	
	// Join conversation room
	socket.on('join_conversation', (conversationId) => {
		socket.join(`conversation_${conversationId}`);
		console.log(`User ${socket.userId} joined conversation ${conversationId}`);
	});
	
	// Leave conversation room
	socket.on('leave_conversation', (conversationId) => {
		socket.leave(`conversation_${conversationId}`);
		console.log(`User ${socket.userId} left conversation ${conversationId}`);
	});
	
	// Handle new message
	socket.on('send_message', async (data) => {
		try {
			const { conversationId, content, messageType = 'text', attachments = [] } = data;
			
			// Import models
			const Message = (await import('./models/Message.js')).default;
			const Conversation = (await import('./models/Conversation.js')).default;
			const User = (await import('./models/User.js')).default;
			
			// Create message in database
			const message = await Message.create({
				conversation: conversationId,
				sender: socket.userId,
				content,
				messageType,
				attachments
			});
			
			// Populate message with sender info
			await message.populate('sender', 'firstName lastName profileImage');
			
			// Update conversation
			const conversation = await Conversation.findById(conversationId);
			if (conversation) {
				conversation.lastMessage = message._id;
				conversation.lastMessageAt = new Date();
				
				// Update unread count for other participants
				conversation.participants.forEach(participantId => {
					if (String(participantId) !== String(socket.userId)) {
						const currentCount = conversation.unreadCount.get(String(participantId)) || 0;
						conversation.unreadCount.set(String(participantId), currentCount + 1);
					}
				});
				
				await conversation.save();
			}
			
			// Emit message to conversation room
			io.to(`conversation_${conversationId}`).emit('new_message', message);
			
			// Emit conversation update to all participants
			conversation.participants.forEach(participantId => {
				io.to(`user_${participantId}`).emit('conversation_updated', {
					conversationId,
					lastMessage: message,
					unreadCount: conversation.unreadCount.get(String(participantId)) || 0
				});
			});
			
		} catch (error) {
			console.error('Error sending message:', error);
			socket.emit('message_error', { error: 'Failed to send message' });
		}
	});
	
	// Handle typing indicator
	socket.on('typing_start', (data) => {
		socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
			userId: socket.userId,
			isTyping: true
		});
	});
	
	socket.on('typing_stop', (data) => {
		socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
			userId: socket.userId,
			isTyping: false
		});
	});
	
	// Handle disconnect
	socket.on('disconnect', () => {
		console.log(`User ${socket.userId} disconnected`);
	});
});


app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews',reviewRoutes)
app.use('/api/webhook',webhookRoutes)
app.use('/api/messages', messageRoutes);

app.use('/api/support', supportRoutes);




// Not found handler
app.use((req, res) => {
	res.status(404).json({ message: 'Route not found' });
});

app.use((err, _req, res, _next) => {
	console.error(err);
	res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
