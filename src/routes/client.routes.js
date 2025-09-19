import express from 'express';
import {
    getClientDashboard,
    getClientProfile,
    updateClientProfile,
    searchProviders
} from '../controllers/client.controller.js';

import { auth } from '../middleware/auth.js';

const router = express.Router();

// Apply client authentication to the client
router.use(auth('client'));
// Dashboard


router.get('/dashboard', getClientDashboard);
// Profile Management
router.get('/profile', getClientProfile);
router.put('/profile', updateClientProfile);


// Provider Search & Discovery

router.get('/search', searchProviders);




export default router;