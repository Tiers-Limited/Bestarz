const express = require('express');
const router = express.Router();

const {
  createSubscription,
  cancelSubscription,
  updateSubscription,
  getCurrentSubscription
} = require('../controllers/subscription.controller.js');

const { auth } = require('../middleware/auth.js');

router.get('/current', auth('provider'), getCurrentSubscription);
router.post('/create', auth('provider'), createSubscription);
router.post('/update', auth('provider'), updateSubscription);
router.post('/cancel', auth('provider'), cancelSubscription);

module.exports = router;
