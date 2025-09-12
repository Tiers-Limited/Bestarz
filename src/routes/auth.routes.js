import { Router } from 'express';
import { signin, signup, me, updateProfile, changePassword } from '../controllers/auth.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/me', auth(), me);
router.put('/profile', auth(), updateProfile);
router.put('/password', auth(), changePassword);

export default router;
