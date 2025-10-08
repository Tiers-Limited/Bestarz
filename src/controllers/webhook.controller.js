// controllers/webhook.controller.js
const Stripe = require('stripe');
const User = require('../models/User.js');
const Payment = require('../models/Payment.js');
const Booking = require('../models/Booking.js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * ====================================================================
 * STRIPE WEBHOOK HANDLER - PRODUCTION-GRADE IMPLEMENTATION
 * ====================================================================
 */
const handleStripeWebhook = async (req, res) => {
  try {
    // STEP 1: Verify the webhook signature
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!endpointSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      console.log('✅ Webhook signature verified:', event.type);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // STEP 2: Log the event
    console.log('🔔 Received Stripe webhook:', event.type, 'ID:', event.id);
    
    // STEP 3: Route to appropriate handler
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        console.warn('⚠️ Payment Intent Failed:', event.data.object.id);
        break;
      default:
        console.log(`🤷‍♀️ Unhandled event type: ${event.type}`);
    }
    
    // STEP 4: Always return 200 to Stripe
    res.json({ received: true });
  } catch (err) {
    console.error('❌ Webhook processing error:', err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Handle checkout.session.completed event
 * This is the primary event for successful payments
 */
async function handleCheckoutSessionCompleted(session) {
  try {
    console.log('🎯 Processing checkout.session.completed');
    console.log('   Session ID:', session.id);
    console.log('   Mode:', session.mode);
    console.log('   Payment Status:', session.payment_status);
    console.log('   Metadata:', session.metadata);
    
    // Only process successful payments
    if (session.payment_status !== 'paid') {
      console.log('⚠️ Payment not completed, status:', session.payment_status);
      return;
    }
    
    if (session.mode === 'subscription') {
      await handleSubscriptionPayment(session);
    } else if (session.mode === 'payment') {
      await handleOneTimePayment(session);
    }
  } catch (error) {
    console.error('❌ Error in handleCheckoutSessionCompleted:', error);
  }
}

/**
 * Handle one-time payment (booking payments)
 */
async function handleOneTimePayment(session) {
  try {
    // Extract metadata
    const { bookingId, paymentType } = session.metadata || {};
    
    if (!bookingId || !paymentType) {
      console.error('❌ Missing required metadata:', { bookingId, paymentType });
      return;
    }
    
    console.log(`🔍 Processing ${paymentType} payment for booking: ${bookingId}`);
    
    // Find the payment record
    const payment = await Payment.findOne({
      booking: bookingId,
      paymentType: paymentType,
      status: 'pending'
    });
    
    if (!payment) {
      console.error('❌ No pending payment found for:', { bookingId, paymentType });
      // List all payments for this booking for debugging
      const allPayments = await Payment.find({ booking: bookingId });
      console.log('📋 All payments for booking:', allPayments.map(p => ({
        id: p._id,
        type: p.paymentType,
        status: p.status,
        amount: p.amount
      })));
      return;
    }
    
    // Check for idempotency
    if (payment.status === 'completed') {
      console.log('⏭️ Payment already processed, skipping');
      return;
    }
    
    console.log('✅ Found payment record:', payment._id);
    
    // Update payment
    payment.status = 'completed';
    payment.stripePaymentIntentId = session.id;
    payment.transactionId = session.payment_intent;
    payment.processedAt = new Date();
    await payment.save();
    
    console.log('✅ Payment marked as completed');
    
    // Update booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.error('❌ Booking not found:', bookingId);
      return;
    }
    
    console.log('📋 Current booking status:', booking.status, 'paymentStatus:', booking.paymentStatus);
    
    if (paymentType === 'advance') {
      booking.paymentStatus = 'advance_paid';
      booking.advancePaid = true;
      booking.status = 'IN_PROGRESS';
      console.log('✅ Booking updated: advance payment completed, status -> IN_PROGRESS');
    } else if (paymentType === 'final') {
      booking.paymentStatus = 'final_paid';
      booking.finalPaid = true;
      booking.status = 'COMPLETED';
      booking.completedAt = new Date();
      console.log('✅ Booking updated: final payment completed, status -> COMPLETED');
    }
    
    await booking.save();
    console.log('✅ Database updates completed successfully');
    
  } catch (error) {
    console.error('❌ Error in handleOneTimePayment:', error);
  }
}

/**
 * Handle subscription payment
 */
async function handleSubscriptionPayment(session) {
  try {
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    
    const user = await User.findOne({
      stripeCustomerId: session.customer
    });
    
    if (user) {
      user.stripeSubscriptionId = subscription.id;
      user.subscriptionStatus = 'active';
      user.subscriptionStart = new Date(subscription.current_period_start * 1000);
      user.subscriptionEnd = new Date(subscription.current_period_end * 1000);
      user.subscriptionPlan = session.metadata?.plan || 'custom';
      await user.save();
      console.log(`✅ Subscription activated for user: ${user.email}`);
    } else {
      console.error('❌ User not found for customer:', session.customer);
    }
  } catch (error) {
    console.error('❌ Error in handleSubscriptionPayment:', error);
  }
}

// Subscription handlers (existing)
async function handleSubscriptionDeleted(subscription) {
  try {
    console.log('Processing subscription deleted:', subscription.id);
    
    const user = await User.findOne({
      stripeSubscriptionId: subscription.id
    });
    
    if (user) {
      user.subscriptionStatus = 'cancelled';
      user.subscriptionEnd = new Date();
      await user.save();
      console.log(`Subscription cancelled for user: ${user.email}`);
    }
  } catch (err) {
    console.error('Error handling subscription deleted:', err);
  }
}

async function handleSubscriptionUpdated(subscription) {
  try {
    console.log('Processing subscription updated:', subscription.id);
    
    const user = await User.findOne({
      stripeSubscriptionId: subscription.id
    });
    
    if (user) {
      user.subscriptionStatus = subscription.status;
      user.subscriptionStart = new Date(subscription.current_period_start * 1000);
      user.subscriptionEnd = new Date(subscription.current_period_end * 1000);
      await user.save();
      console.log(`Subscription updated for user: ${user.email}`);
    }
  } catch (err) {
    console.error('Error handling subscription updated:', err);
  }
}

module.exports = {
  handleStripeWebhook,
};