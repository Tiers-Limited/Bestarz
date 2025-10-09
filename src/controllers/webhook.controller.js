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
  console.log('🚀 WEBHOOK ENDPOINT HIT!');
  console.log('📋 Headers:', req.headers);
  console.log('📦 Body type:', typeof req.body);
  console.log('📦 Body length:', req.body ? req.body.length : 'no body');
  
  try {
    // STEP 1: Verify the webhook signature (with development mode bypass)
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    let event;
    
    // In development, allow bypassing signature verification for testing
    if (isDevelopment && (!sig || sig === 'test_signature_for_simulation' || sig === 'test_signature')) {
      console.log('🧪 DEVELOPMENT MODE: Bypassing webhook signature verification');
      console.log('📦 Using raw body as event data');
      
      // Parse the body as JSON to get the event
      try {
        event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        console.log('✅ Development webhook parsed:', event.type || 'unknown type');
      } catch (parseError) {
        console.error('❌ Failed to parse webhook body:', parseError.message);
        return res.status(400).json({ error: 'Invalid JSON in webhook body' });
      }
    } else {
      // Production: Strict signature verification
      if (!endpointSecret) {
        console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
        return res.status(500).json({ error: 'Webhook secret not configured' });
      }
      
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        console.log('✅ Webhook signature verified:', event.type);
      } catch (err) {
        console.error('❌ Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    }
    
    // STEP 2: Log the event
    console.log('🔔 Received Stripe webhook:', event.type, 'ID:', event.id);
    
    // STEP 3: Route to appropriate handler
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
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
    console.log('🎯 Processing subscription payment for session:', session.id);
    console.log('📋 Session details:', {
      id: session.id,
      customer: session.customer,
      subscription: session.subscription,
      metadata: session.metadata,
      mode: session.mode,
      payment_status: session.payment_status
    });

    // CRITICAL: Extract userId from metadata first
    const userId = session.metadata?.userId;
    if (!userId) {
      console.error('❌ No userId in session metadata:', session.metadata);
      return;
    }

    // Retrieve subscription from Stripe
    if (!session.subscription) {
      console.error('❌ No subscription ID in session');
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    console.log('📋 Retrieved subscription:', {
      id: subscription.id,
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end
    });

    // Find user by userId (more reliable than customer lookup)
    const user = await User.findById(userId);
    if (!user) {
      console.error('❌ User not found for userId:', userId);
      return;
    }

    console.log('👤 Found user for subscription:', user.email);

    // Update user with comprehensive subscription data
    const updateData = {
      stripeCustomerId: session.customer,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status === 'active' ? 'active' : subscription.status,
      subscriptionPlan: session.metadata?.planType || 'professional',
      stripePriceId: subscription.items.data[0]?.price?.id,
      subscriptionStart: new Date(subscription.current_period_start * 1000),
      subscriptionEnd: new Date(subscription.current_period_end * 1000),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      updatedAt: new Date()
    };

    console.log('📝 Updating user with data:', updateData);

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (updatedUser) {
      console.log(`✅ Subscription activated for user: ${user.email}`);
      console.log(`📊 Updated subscription details:`, {
        plan: updatedUser.subscriptionPlan,
        status: updatedUser.subscriptionStatus,
        subscriptionId: updatedUser.stripeSubscriptionId
      });
    } else {
      console.error('❌ Failed to update user in database');
    }

  } catch (error) {
    console.error('❌ Error in handleSubscriptionPayment:', error);
    console.error('❌ Error stack:', error.stack);
  }
}

/**
 * Handle subscription deleted/canceled
 */
async function handleSubscriptionDeleted(subscription) {
  try {
    console.log('🚫 Processing subscription deleted:', subscription.id);
    
    const user = await User.findOne({
      stripeSubscriptionId: subscription.id
    });
    
    if (!user) {
      console.error('❌ User not found for subscription:', subscription.id);
      return;
    }

    console.log('👤 Found user for canceled subscription:', user.email);
    
    // Update user subscription to canceled status
    const updateData = {
      subscriptionStatus: 'canceled',
      subscriptionPlan: 'none',
      subscriptionEnd: new Date(),
      cancelAtPeriodEnd: false,
      stripeSubscriptionId: null, // Clear the subscription ID
      stripePriceId: null,
      updatedAt: new Date()
    };

    await User.findByIdAndUpdate(user._id, updateData);
    console.log(`✅ Subscription canceled for user: ${user.email}`);
    
  } catch (err) {
    console.error('❌ Error handling subscription deleted:', err);
  }
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription) {
  try {
    console.log('📝 Processing subscription updated:', subscription.id, 'Status:', subscription.status);
    
    const user = await User.findOne({
      stripeSubscriptionId: subscription.id
    });
    
    if (!user) {
      console.error('❌ User not found for subscription:', subscription.id);
      return;
    }

    console.log('👤 Found user for updated subscription:', user.email);
    console.log('🔍 Stripe subscription details:', {
      id: subscription.id,
      status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end
    });
    console.log('📊 Current user subscription in DB:', {
      status: user.subscriptionStatus,
      plan: user.subscriptionPlan,
      stripeId: user.stripeSubscriptionId
    });
    
    // Map Stripe subscription status to our system
    let subscriptionStatus = subscription.status;
    if (subscription.status === 'active' && subscription.cancel_at_period_end) {
      console.log('⚠️ Subscription is active but marked to cancel at period end');
      subscriptionStatus = 'canceled_pending';
    }
    
    // PROTECTION: Don't override a recently activated subscription to canceled_pending
    // if the user just completed payment (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentlyUpdated = user.updatedAt && user.updatedAt > fiveMinutesAgo;
    const wasJustActivated = user.subscriptionStatus === 'active' && recentlyUpdated;
    
    if (wasJustActivated && subscriptionStatus === 'canceled_pending') {
      console.log('🛡️ PROTECTION: Preventing override of recently activated subscription');
      console.log('⏳ User subscription was recently activated, ignoring webhook cancel_at_period_end');
      subscriptionStatus = 'active'; // Keep it active
    }
    
    // Update user with latest subscription data
    const updateData = {
      subscriptionStatus: subscriptionStatus,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      updatedAt: new Date()
    };

    // Only update subscription dates if still active
    if (subscription.status === 'active') {
      updateData.subscriptionStart = new Date(subscription.current_period_start * 1000);
      updateData.subscriptionEnd = new Date(subscription.current_period_end * 1000);
    }

    await User.findByIdAndUpdate(user._id, updateData);
    console.log(`✅ Subscription updated for user: ${user.email} - Status: ${subscriptionStatus}`);
    
  } catch (err) {
    console.error('❌ Error handling subscription updated:', err);
  }
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(subscription) {
  try {
    console.log('🆕 Processing subscription created:', subscription.id);
    
    const user = await User.findOne({
      stripeCustomerId: subscription.customer
    });
    
    if (!user) {
      console.error('❌ User not found for customer:', subscription.customer);
      return;
    }

    console.log('👤 Found user for new subscription:', user.email);
    
    // Update user with new subscription data
    const updateData = {
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status === 'active' ? 'active' : subscription.status,
      stripePriceId: subscription.items.data[0].price.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      updatedAt: new Date()
    };

    // Set subscription dates if active
    if (subscription.status === 'active') {
      updateData.subscriptionStart = new Date(subscription.current_period_start * 1000);
      updateData.subscriptionEnd = new Date(subscription.current_period_end * 1000);
    }

    await User.findByIdAndUpdate(user._id, updateData);
    console.log(`✅ New subscription created for user: ${user.email} - Status: ${subscription.status}`);
    
  } catch (err) {
    console.error('❌ Error handling subscription created:', err);
  }
}

/**
 * Handle invoice payment succeeded (recurring payments)
 */
async function handleInvoicePaymentSucceeded(invoice) {
  try {
    console.log('💰 Processing invoice payment succeeded:', invoice.id);
    
    // Only process subscription invoices
    if (!invoice.subscription) {
      console.log('⏭️ Skipping non-subscription invoice');
      return;
    }
    
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const user = await User.findOne({
      stripeSubscriptionId: subscription.id
    });
    
    if (!user) {
      console.error('❌ User not found for subscription:', subscription.id);
      return;
    }

    console.log('👤 Found user for invoice payment:', user.email);
    
    // Update user subscription periods for successful recurring payment
    const updateData = {
      subscriptionStatus: 'active',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      subscriptionEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      updatedAt: new Date()
    };

    await User.findByIdAndUpdate(user._id, updateData);
    console.log(`✅ Recurring payment processed for user: ${user.email}`);
    
  } catch (err) {
    console.error('❌ Error handling invoice payment succeeded:', err);
  }
}

/**
 * Handle invoice payment failed
 */
async function handleInvoicePaymentFailed(invoice) {
  try {
    console.log('❌ Processing invoice payment failed:', invoice.id);
    
    // Only process subscription invoices
    if (!invoice.subscription) {
      console.log('⏭️ Skipping non-subscription invoice');
      return;
    }
    
    const user = await User.findOne({
      stripeSubscriptionId: invoice.subscription
    });
    
    if (!user) {
      console.error('❌ User not found for subscription:', invoice.subscription);
      return;
    }

    console.log('👤 Found user for failed payment:', user.email);
    
    // Update user subscription status to past_due
    const updateData = {
      subscriptionStatus: 'past_due',
      updatedAt: new Date()
    };

    await User.findByIdAndUpdate(user._id, updateData);
    console.log(`⚠️ Payment failed for user: ${user.email} - Status: past_due`);
    
  } catch (err) {
    console.error('❌ Error handling invoice payment failed:', err);
  }
}

module.exports = {
  handleStripeWebhook,
};