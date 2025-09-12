import { Router } from 'express';
import { 
	createBooking, 
	listMyBookings, 
	updateBookingStatus, 
	getBooking, 
	getBookingStats 
} from '../controllers/booking.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.post('/', auth('client'), createBooking);
router.get('/me', auth(['client', 'provider']), listMyBookings);
router.get('/stats', auth(['client', 'provider']), getBookingStats);
router.get('/:id', auth(), getBooking);
router.patch('/:id/status', auth('provider'), updateBookingStatus);

export default router;
