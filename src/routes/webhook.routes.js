const express = require('express');
const router = express.Router();

const { handleStripeWebhook } = require('../controllers/webhook.controller.js');

// Single webhook endpoint for all Stripe events
router.post('/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;
