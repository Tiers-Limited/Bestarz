import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import authRoutes from './routes/auth.routes.js';
import providerRoutes from './routes/provider.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import clientRoutes from './routes/client.routes.js'
import adminRoutes from './routes/admin.routes.js';




const app = express();
const server = createServer(app);

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

app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);





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
