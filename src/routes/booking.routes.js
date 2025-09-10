import { Router } from 'express';
import { createBooking, listMyBookings, updateBookingStatus } from '../controllers/booking.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.post('/', auth('client'), createBooking);
router.get('/me', auth(['client', 'provider']), listMyBookings);
router.patch('/:id/status', auth('provider'), updateBookingStatus);

export default router;
