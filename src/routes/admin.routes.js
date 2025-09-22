const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/admin.controller.js');

const { auth } = require('../middleware/auth.js');

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

module.exports = router;
