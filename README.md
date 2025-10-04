# Best★rz Backend API

A comprehensive backend API for the Best★rz event booking platform, built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Management**: Provider and client authentication and profiles
- **Booking System**: Complete event booking lifecycle management
- **Payment Processing**: Stripe integration with 80/20 revenue split
- **Email Notifications**: Automated booking confirmations and updates
- **Admin Dashboard**: Platform management and analytics
- **Real-time Messaging**: Provider-client communication system

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **Payments**: Stripe API
- **Email**: Nodemailer with Gmail SMTP
- **File Upload**: Multer
- **Validation**: Custom middleware

## 📦 Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   EMAIL=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   FRONTEND_URL=http://localhost:5173
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## 📁 Project Structure

```
src/
├── config/          # Configuration files (database, email)
├── controllers/     # Route handlers
├── middleware/      # Custom middleware (auth, validation)
├── models/         # MongoDB schemas
├── routes/         # API route definitions
├── services/       # Business logic services (Stripe, etc.)
└── server.js       # Application entry point
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/:id/confirm` - Confirm booking (provider only)
- `PATCH /api/bookings/:id/complete` - Mark booking complete (client only)

### Payments
- `POST /api/payments/create-session` - Create Stripe checkout session
- `POST /api/payments/webhook` - Stripe webhook handler

### Subscriptions
- `POST /api/subscriptions/create` - Create subscription
- `POST /api/subscriptions/cancel` - Cancel subscription

## 💰 Payment Flow

1. **Client Books Event** → Booking created with 'unpaid' status
2. **Provider Confirms** → Email notification sent, booking status → 'confirmed'
3. **Client Pays** → Stripe checkout session, payment status → 'paid'
4. **Client Completes** → 80% to provider, 20% to admin via Stripe transfers

## 📧 Email Notifications

- Booking confirmation emails
- Payment receipts
- Status updates
- Customer support notifications

## 🔒 Security

- JWT authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting

## 📊 Database Models

- **User**: Provider/client profiles
- **Provider**: Service provider details
- **Booking**: Event booking records
- **Payment**: Transaction records
- **Message**: Chat messages
- **Review**: Service reviews

## 🧪 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (defaults to 5000) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `EMAIL` | Gmail address for notifications | Yes |
| `EMAIL_PASSWORD` | Gmail app password | Yes |
| `FRONTEND_URL` | Frontend application URL | Yes |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software for Best★rz platform.
