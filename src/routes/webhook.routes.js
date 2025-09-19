// routes/webhook.routes.js
import express from 'express';
import { handleStripeWebhook } from '../controllers/webhook.controller.js';
const router = express.Router();
// Single webhook endpoint for all Stripe events
router.post('/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);


export default router;

