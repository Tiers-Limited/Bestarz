const express = require('express');
const router = express.Router();

const {
    getClientDashboard,
    getClientProfile,
    updateClientProfile,
    searchProviders
} = require('../controllers/client.controller.js');

const { auth } = require('../middleware/auth.js');

// Apply client authentication to the client
router.use(auth('client'));

// Dashboard
router.get('/dashboard', getClientDashboard);

// Profile Management
router.get('/profile', getClientProfile);
router.put('/profile', updateClientProfile);

// Provider Search & Discovery
router.get('/search', searchProviders);

module.exports = router;
