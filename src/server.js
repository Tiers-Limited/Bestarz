import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';

import authRoutes from './routes/auth.routes.js';
import providerRoutes from './routes/provider.routes.js';
import bookingRoutes from './routes/booking.routes.js';

dotenv.config();

const app = express();
const server = createServer(app);



app.use(cors({ origin: '*', credentials: false }));
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
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
