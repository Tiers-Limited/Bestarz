import { Router } from 'express';
import { 
	createReview, 
	getProviderReviews, 
	getMyReviews, 
	updateReview, 
	deleteReview 
} from '../controllers/review.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.post('/', auth('client'), createReview);
router.get('/provider/:providerId', getProviderReviews);
router.get('/me', auth(['client', 'provider']), getMyReviews);
router.put('/:id', auth(), updateReview);
router.delete('/:id', auth(), deleteReview);

export default router;
