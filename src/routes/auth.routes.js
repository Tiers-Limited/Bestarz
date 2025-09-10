import { Router } from 'express';
import { signin, signup, me } from '../controllers/auth.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/me', auth(), me);

export default router;
