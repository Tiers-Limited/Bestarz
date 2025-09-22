const express = require('express');
const router = express.Router();

const {
  createSubscription,
  cancelSubscription,
  updateSubscription
} = require('../controllers/subscription.controller.js');

const { auth } = require('../middleware/auth.js');

router.post('/create', auth('provider'), createSubscription);
router.post('/update', auth('provider'), updateSubscription);
router.post('/cancel', auth('provider'), cancelSubscription);

module.exports = router;
