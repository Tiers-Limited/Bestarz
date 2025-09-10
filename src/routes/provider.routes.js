import { Router } from 'express';
import { listProviders, getProvider, upsertMyProviderProfile } from '../controllers/provider.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/', listProviders);
router.get('/:id', getProvider);
router.put('/me', auth('provider'), upsertMyProviderProfile);

export default router;
