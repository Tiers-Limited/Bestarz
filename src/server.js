require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

// Routes
const authRoutes = require('./routes/auth.routes');
const providerRoutes = require('./routes/provider.routes');
const bookingRoutes = require('./routes/booking.routes');
const paymentRoutes = require('./routes/payment.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const clientRoutes = require('./routes/client.routes');
const adminRoutes = require('./routes/admin.routes');
const reviewRoutes = require('./routes/review.routes');
const webhookRoutes = require('./routes/webhook.routes');
const messageRoutes = require('./routes/message.routes');
const supportRoutes = require('./routes/support.routes');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

const app = express();
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// ✅ CRITICAL: Add this middleware to make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors({ origin: '*', credentials: false }));
app.use(helmet());

app.use((req, res, next) => {
  if (req.originalUrl.includes('webhook')) {
    next();
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});

app.use(morgan('dev'));

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bestarz';
console.log('🔄 Connecting to MongoDB...');
mongoose.set('strictQuery', true);
mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'bestarz-backend' });
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));

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
  console.log(`👤 User ${socket.userId} connected`);
  socket.join(`user_${socket.userId}`);

  socket.on('join_conversation', (conversationId) => {
    console.log(`🏠 User ${socket.userId} joining conversation: ${conversationId}`);
    socket.join(`conversation_${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId) => {
    console.log(`🚪 User ${socket.userId} leaving conversation: ${conversationId}`);
    socket.leave(`conversation_${conversationId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      console.log("📨 Socket send_message event received:", data);
      console.log("👤 socket.userId:", socket.userId);
  
      const { conversationId, content, messageType = 'text', attachments = [] } = data;
  
      const message = await Message.create({
        conversation: conversationId,
        sender: socket.userId,
        content,
        messageType,
        attachments
      });
  
      console.log("📝 Message created:", message._id);
  
      await message.populate('sender', 'firstName lastName profileImage');
  
      const conversation = await Conversation.findById(conversationId);
      console.log("💬 Conversation found:", conversation?._id);
  
      if (conversation) {
        conversation.lastMessage = message._id;
        conversation.lastMessageAt = new Date();
  
        conversation.participants.forEach(participantId => {
          if (String(participantId) !== String(socket.userId)) {
            const currentCount = conversation.unreadCount.get(String(participantId)) || 0;
            conversation.unreadCount.set(String(participantId), currentCount + 1);
          }
        });
  
        await conversation.save();
      }
  
      console.log("🚀 EMITTING to conversation:", conversationId);
      io.to(`conversation_${conversationId}`).emit('new_message', message);
  
      conversation.participants.forEach(participantId => {
        io.to(`user_${participantId}`).emit('conversation_updated', {
          conversationId,
          lastMessage: message,
          unreadCount: conversation.unreadCount.get(String(participantId)) || 0
        });
      });
  
    } catch (error) {
      console.error('❌ Error sending message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });



  socket.on('disconnect', () => {
    console.log(`👋 User ${socket.userId} disconnected`);
  });
});

// Routes - THESE MUST COME AFTER THE IO MIDDLEWARE
app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/support', supportRoutes);

// Not found handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});