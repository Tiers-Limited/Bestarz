// controllers/webhook.controller.js
const User = require('../models/User.js');
const Payment = require('../models/Payment.js');
const Booking = require('../models/Booking.js');
const Provider = require('../models/Provider.js');
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle different event types
    switch (event.type) {
      // 🔥 SUBSCRIPTION EVENTS
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      // 🔥 PAYMENT EVENTS  
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
        
      // 🔥 REFUND EVENTS
      case 'charge.dispute.created':
        await handleChargeDispute(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ message: err.message });
  }
};

// 🔥 SUBSCRIPTION HANDLERS
async function handleCheckoutSessionCompleted(session) {
  try {
    console.log('Processing checkout session:', session.id);
    
    if (session.mode === 'subscription') {
      // Handle subscription checkout
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
        console.log(`Subscription activated for user: ${user.email}`);
      }
    } else if (session.mode === 'payment') {
      // Handle one-time payment checkout
      const payment = await Payment.findOne({ 
        stripePaymentIntentId: session.id 
      });
      
      if (payment) {
        payment.status = 'completed';
        payment.transactionId = session.payment_intent;
        payment.processedAt = new Date();
        await payment.save();
        
        // Update booking payment status
        const booking = await Booking.findById(payment.booking);
        if (booking) {
          booking.paymentStatus = 'paid';
          await booking.save();
        }
        
        console.log(`Payment completed for session: ${session.id}`);
      }
    }
  } catch (err) {
    console.error('Error handling checkout session completed:', err);
  }
}

async function handleSubscriptionDeleted(subscription) {
  try {
    console.log('Processing subscription deletion:', subscription.id);
    
    const user = await User.findOne({
      stripeSubscriptionId: subscription.id
    });
    
    if (user) {
      user.subscriptionStatus = 'expired';
      await user.save();
      console.log(`Subscription expired for user: ${user.email}`);
    }
  } catch (err) {
    console.error('Error handling subscription deleted:', err);
  }
}

async function handleSubscriptionUpdated(subscription) {
  try {
    console.log('Processing subscription update:', subscription.id);
    
    const user = await User.findOne({
      stripeSubscriptionId: subscription.id
    });
    
    if (user) {
      // Update subscription dates and status
      user.subscriptionStatus = subscription.status;
      user.subscriptionStart = new Date(subscription.current_period_start * 1000);
      user.subscriptionEnd = new Date(subscription.current_period_end * 1000);
      
      // Handle cancellation
      if (subscription.cancel_at_period_end) {
        user.subscriptionStatus = 'canceled';
      }
      
      await user.save();
      console.log(`Subscription updated for user: ${user.email}`);
    }
  } catch (err) {
    console.error('Error handling subscription updated:', err);
  }
}

// 🔥 PAYMENT HANDLERS
async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    console.log('Processing payment intent succeeded:', paymentIntent.id);
    
    const payment = await Payment.findOne({ 
      transactionId: paymentIntent.id 
    });
    
    if (payment && payment.status !== 'completed') {
      payment.status = 'completed';
      payment.processedAt = new Date();
      await payment.save();
      
      // Update booking payment status based on payment type
      const booking = await Booking.findById(payment.booking);
      if (booking) {
        if (payment.paymentType === 'advance') {
          // Advance payment completed - move booking to IN_PROGRESS
          booking.paymentStatus = 'advance_paid';
          booking.advancePaid = true;
          booking.status = 'IN_PROGRESS';
          console.log(`Advance payment completed for booking: ${booking._id}`);
        } else if (payment.paymentType === 'final') {
          // Final payment completed - mark booking as COMPLETED
          booking.paymentStatus = 'final_paid';
          booking.finalPaid = true;
          booking.status = 'COMPLETED';
          booking.completedAt = new Date();
          
          // Handle revenue transfer (80% to provider, 20% to admin)
          await handleRevenueTransfer(payment, booking);
          
          console.log(`Final payment completed and booking marked as COMPLETED: ${booking._id}`);
        }
        await booking.save();
      }
      
      console.log(`Payment intent succeeded for: ${paymentIntent.id}`);
    }
  } catch (err) {
    console.error('Error handling payment intent succeeded:', err);
  }
}

async function handlePaymentIntentFailed(paymentIntent) {
  try {
    console.log('Processing payment intent failed:', paymentIntent.id);
    
    const payment = await Payment.findOne({ 
      transactionId: paymentIntent.id 
    });
    
    if (payment) {
      payment.status = 'failed';
      await payment.save();
      
      // Update booking payment status
      const booking = await Booking.findById(payment.booking);
      if (booking) {
        booking.paymentStatus = 'failed';
        await booking.save();
      }
      
      console.log(`Payment intent failed for: ${paymentIntent.id}`);
    }
  } catch (err) {
    console.error('Error handling payment intent failed:', err);
  }
}

// Handle revenue transfer (80% to provider, 20% to admin)
async function handleRevenueTransfer(payment, booking) {
  try {
    console.log(`Processing revenue transfer for payment: ${payment._id}`);
    
    // Get provider's Stripe account ID
    const provider = await User.findById(booking.provider.user).populate('provider');
    
    if (!provider.stripeAccountId) {
      console.error(`Provider ${provider._id} does not have Stripe account set up`);
      return;
    }
    
    // Transfer 80% to provider
    const providerAmount = payment.providerEarnings; // Already calculated as 80%
    
    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(providerAmount * 100), // Convert to cents
        currency: 'usd',
        destination: provider.stripeAccountId,
        description: `Payment for booking ${booking._id} - ${payment.paymentType} payment`,
        metadata: {
          bookingId: booking._id.toString(),
          paymentId: payment._id.toString(),
          paymentType: payment.paymentType,
          providerEarnings: providerAmount.toString()
        }
      });
      
      // Update payment record with transfer details
      payment.transferStatus = 'transferred';
      payment.stripeTransferId = transfer.id;
      await payment.save();
      
      // Update booking revenue tracking
      booking.providerAmount = (booking.providerAmount || 0) + providerAmount;
      booking.adminAmount = (booking.adminAmount || 0) + payment.platformFee;
      booking.transferStatus = payment.paymentType === 'final' ? 'transferred' : 'partial';
      await booking.save();
      
      console.log(`Revenue transferred successfully: $${providerAmount} to provider, $${payment.platformFee} to admin`);
      
    } catch (transferError) {
      console.error('Stripe transfer failed:', transferError);
      payment.transferStatus = 'failed';
      await payment.save();
    }
    
  } catch (err) {
    console.error('Error handling revenue transfer:', err);
  }
}

module.exports = { handleStripeWebhook };
