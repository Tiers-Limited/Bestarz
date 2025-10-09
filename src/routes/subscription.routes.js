const express = require('express');
const router = express.Router();

const {
  createCheckoutSession,
  getSubscriptionStatus,
  cancelUserSubscription,
  verifySubscriptionSession,
  updateSubscriptionManually
} = require('../controllers/subscription.controller.js');

const { auth } = require('../middleware/auth.js');

// Create subscription checkout session
router.post('/create-checkout', auth('provider'), createCheckoutSession);

// Get subscription status
router.get('/status', auth('provider'), getSubscriptionStatus);

// Cancel subscription
router.post('/cancel', auth('provider'), cancelUserSubscription);

// Verify subscription session after payment
router.post('/verify-session', auth('provider'), verifySubscriptionSession);

// Manual subscription update (backup for webhook failures)
router.post('/update-manual', auth('provider'), updateSubscriptionManually);

module.exports = router;
