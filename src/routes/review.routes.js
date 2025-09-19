import { Router } from 'express';
import { 
	createReview, 
	getMyReviews, 
	getProviderReviews, 
	updateReview, 
	deleteReview 
} from '../controllers/review.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.get('/me', auth(['client', 'provider']), getMyReviews);
router.post('/', auth('client'), createReview);
router.get('/provider/:providerId', getProviderReviews);
router.put('/:id', auth(), updateReview);
router.delete('/:id', auth(), deleteReview);

export default router;
