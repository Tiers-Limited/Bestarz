# Bestarz Backend API

Complete backend API for the Bestarz platform with Stripe payments and Socket.IO real-time messaging.

## 🚀 Features

- **Authentication & Authorization** - JWT-based auth with role-based access control
- **Provider Management** - Complete provider profiles and services
- **Booking System** - Full booking lifecycle management
- **Payment Processing** - Stripe integration with webhooks
- **Real-time Messaging** - Socket.IO for instant communication
- **Review System** - Rating and review functionality
- **Rate Cards** - Service pricing management for providers

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Stripe Account
- npm or yarn

## 🛠️ Installation

1. **Clone and install dependencies:**
   ```bash
   cd Backend
   npm install
   ```

2. **Environment Setup:**
   ```bash
   cp env.example .env
   ```

3. **Configure Environment Variables:**
   ```env
   # Database
   MONGODB_URI=mongodb://127.0.0.1:27017/bestarz

   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here

   # Server
   PORT=5000
   NODE_ENV=development

   # Frontend URL
   FRONTEND_URL=http://localhost:3000

   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

## 🔑 Stripe Setup

1. **Get Stripe Keys:**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/)
   - Get your **Secret Key** and **Publishable Key**
   - Add them to your `.env` file

2. **Webhook Setup:**
   - In Stripe Dashboard, go to Webhooks
   - Add endpoint: `https://yourdomain.com/api/payments/webhook`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`
   - Copy the webhook secret to your `.env` file

## 📡 Socket.IO Setup

The backend automatically handles Socket.IO connections. Frontend needs to:

1. **Install Socket.IO client:**
   ```bash
   npm install socket.io-client
   ```

2. **Connect with authentication:**
   ```javascript
   import io from 'socket.io-client';
   
   const socket = io('http://localhost:5000', {
     auth: {
       token: 'your_jwt_token_here'
     }
   });
   ```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Provider Endpoints
- `GET /api/providers` - List providers (public)
- `GET /api/providers/:id` - Get provider by ID
- `GET /api/providers/slug/:slug` - Get provider by slug
- `GET /api/providers/me/profile` - Get my provider profile
- `PUT /api/providers/me` - Update provider profile
- `GET /api/providers/me/stats` - Get provider statistics

### Booking Endpoints
- `POST /api/bookings` - Create booking (client only)
- `GET /api/bookings/me` - Get my bookings
- `GET /api/bookings/stats` - Get booking statistics
- `GET /api/bookings/:id` - Get specific booking
- `PATCH /api/bookings/:id/status` - Update booking status (provider only)

### Payment Endpoints
- `POST /api/payments` - Create payment (returns Stripe link)
- `POST /api/payments/confirm` - Confirm payment
- `POST /api/payments/webhook` - Stripe webhook endpoint
- `GET /api/payments/me` - Get my payments
- `GET /api/payments/stats` - Get payment statistics
- `GET /api/payments/:id` - Get specific payment
- `PATCH /api/payments/:id/status` - Update payment status
- `POST /api/payments/:id/refund` - Create refund

### Messaging Endpoints
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/conversations/:id` - Get specific conversation
- `GET /api/messages/conversations/:conversationId/messages` - Get messages
- `POST /api/messages/conversations` - Create conversation
- `POST /api/messages/conversations/:conversationId/messages` - Send message
- `PATCH /api/messages/conversations/:conversationId/read` - Mark as read
- `GET /api/messages/unread-count` - Get unread count

### Review Endpoints
- `POST /api/reviews` - Create review (client only)
- `GET /api/reviews/provider/:providerId` - Get provider reviews (public)
- `GET /api/reviews/me` - Get my reviews
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Rate Card Endpoints
- `POST /api/rate-cards` - Create rate card (provider only)
- `GET /api/rate-cards/me` - Get my rate cards
- `GET /api/rate-cards/me/:id` - Get specific rate card
- `PUT /api/rate-cards/me/:id` - Update rate card
- `DELETE /api/rate-cards/me/:id` - Delete rate card
- `PATCH /api/rate-cards/me/:id/toggle` - Toggle rate card status
- `GET /api/rate-cards/provider/:providerId` - Get provider rate cards (public)

## 🔄 Payment Flow

1. **Client creates payment:**
   ```javascript
   POST /api/payments
   {
     "bookingId": "booking_id",
     "amount": 800,
     "paymentMethod": "stripe"
   }
   ```

2. **Backend returns Stripe link:**
   ```javascript
   {
     "payment": {...},
     "paymentLink": "https://checkout.stripe.com/...",
     "sessionId": "cs_..."
   }
   ```

3. **Frontend redirects to Stripe:**
   ```javascript
   window.location.href = response.paymentLink;
   ```

4. **Stripe webhook confirms payment:**
   - Automatically updates payment status
   - Updates booking payment status

## 💬 Socket.IO Events

### Client Events
- `join_conversation` - Join a conversation room
- `leave_conversation` - Leave a conversation room
- `send_message` - Send a message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator

### Server Events
- `new_message` - New message received
- `conversation_updated` - Conversation updated
- `user_typing` - User typing indicator
- `message_error` - Message sending error

## 🧪 Testing

Import the Postman collection:
- File: `Bestarz_API_Collection.postman_collection.json`
- Set environment variables in Postman
- Test all endpoints

## 🚀 Deployment

1. **Set production environment variables**
2. **Deploy to your preferred platform** (Heroku, AWS, etc.)
3. **Update Stripe webhook URL** to production endpoint
4. **Update frontend URL** in environment variables

## 📝 Notes

- All timestamps are in UTC
- JWT tokens expire in 7 days
- Socket.IO requires authentication token
- Stripe webhooks must be configured for production
- Rate cards support complex pricing structures with add-ons
- Real-time messaging includes typing indicators and unread counts