import { Router } from 'express';
import {
    getPlatformStats,
    getAllUsers,
    getAllProviders,
    getAllClients,
    updateUserStatus,
    getAllBookings,
    getAllPayments,
    getAnalytics,
    getUserDetails,
    getPlatformSettings,
    updatePlatformSettings
} from '../controllers/admin.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// All admin routes require admin role
router.use(auth('admin'));

// Platform statistics
router.get('/stats', getPlatformStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserDetails);
router.patch('/users/:userId/status', updateUserStatus);

// Provider management
router.get('/providers', getAllProviders);

// Client management
router.get('/clients', getAllClients);

// Booking management
router.get('/bookings', getAllBookings);

// Payment management
router.get('/payments', getAllPayments);

// Analytics
router.get('/analytics', getAnalytics);


// Platform Settings


router.get('/platform-settings', getPlatformSettings);
router.put('/platform-settings', updatePlatformSettings);




export default router;
