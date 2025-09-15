// routes/subscription.routes.js
import express from 'express';
import {
  createSubscription,
  cancelSubscription,
  updateSubscription,
  subscriptionWebhook
} from '../controllers/subscription.controller.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();


router.post('/create',auth('provider'), createSubscription);
router.post('/cancel',auth('provider'), cancelSubscription);
router.post('/update',auth('provider'), updateSubscription);

router.post('/webhook', express.raw({ type: 'application/json' }), subscriptionWebhook);


export default router;
