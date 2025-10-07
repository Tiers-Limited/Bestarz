const User = require('../models/User.js');
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Create subscription with raw amount
 const createSubscription = async (req, res) => {
  try {
    const { plan, amount } = req.body; 

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    // Ensure Stripe customer exists
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // ✅ Create checkout session with price_data (USD, monthly)
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amount*100, // cents
            product_data: {
              name: `${plan} Plan`
            },
            recurring: { interval: 'month' }
          },
          quantity: 1
        }
      ],

      metadata: { plan }, 
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error('Create subscription error:', err);
    return res.status(500).json({ message: err.message });
  }
};


 const cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
      if (!user) {
        console.info('Cancel subscription: user not found for id', req.user.id);
        return res.status(404).json({ message: 'User not found' });
      }

      // If there's no Stripe subscription id, still mark the subscription as canceled
      if (!user.stripeSubscriptionId) {
        console.info('Cancel subscription: no stripeSubscriptionId for user', user.email || user._id);
        user.subscriptionStatus = 'canceled';
        user.subscriptionPlan = 'none';
        user.stripeSubscriptionId = null;
        user.subscriptionStart = null;
        user.subscriptionEnd = null;
        await user.save();
        return res.json({ message: 'Subscription canceled (no Stripe subscription id found). Local status updated.', user });
      }

      // Try cancelling the subscription on Stripe
      let stripeError = null;
      try {
        await stripe.subscriptions.update(user.stripeSubscriptionId, {
          cancel_at_period_end: true // recurring but cancel at end
        });
      } catch (err) {
        stripeError = err;
        console.error('Stripe cancel error:', err.message);
      }

      // Always mark local subscription as canceled, even if Stripe fails
      user.subscriptionStatus = 'canceled';
      user.subscriptionPlan = 'none';
      user.stripeSubscriptionId = null;
      user.subscriptionStart = null;
      user.subscriptionEnd = null;
      await user.save();

      if (stripeError) {
        return res.json({ message: 'Subscription canceled locally. Stripe error: ' + stripeError.message, user });
      } else {
        return res.json({ message: 'Subscription canceled', user });
      }
  } catch (err) {
    console.error('Cancel subscription error:', err);
    return res.status(500).json({ message: err.message });
  }
};


 const updateSubscription = async (req, res) => {
  try {
    const { plan, amount } = req.body; // new plan and amount

    const user = await User.findById(req.user.id);
    if (!user || !user.stripeSubscriptionId) {
      return res.status(400).json({ message: 'No active subscription found' });
    }

    const subscription = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId
    );

    // Update subscription with new amount
    const updatedSub = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: false,
      items: [
        {
          id: subscription.items.data[0].id,
          price_data: {
            currency: 'usd',
            unit_amount: amount,
            product_data: {
              name: `${plan} Plan`
            },
            recurring: { interval: 'month' }
          }
        }
      ]
    });

    user.subscriptionPlan = plan;
    user.subscriptionStatus = 'active';
    await user.save();

    return res.json({ message: 'Subscription updated', user, updatedSub });
  } catch (err) {
    console.error('Update subscription error:', err);
    return res.status(500).json({ message: err.message });
  }
};




// ✅ Get current subscription details
const getCurrentSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return subscription details from database
    const subscriptionData = {
      subscriptionPlan: user.subscriptionPlan || 'none',
      subscriptionStatus: user.subscriptionStatus || 'canceled',
      stripeSubscriptionId: user.stripeSubscriptionId,
      subscriptionStart: user.subscriptionStart,
      subscriptionEnd: user.subscriptionEnd,
      hasActiveSubscription: user.subscriptionStatus === 'active' && user.subscriptionPlan !== 'none'
    };

    // If user has active Stripe subscription, get latest details
    if (user.stripeSubscriptionId && user.subscriptionStatus === 'active') {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        subscriptionData.stripeDetails = {
          id: stripeSubscription.id,
          status: stripeSubscription.status,
          current_period_start: new Date(stripeSubscription.current_period_start * 1000),
          current_period_end: new Date(stripeSubscription.current_period_end * 1000),
          cancel_at_period_end: stripeSubscription.cancel_at_period_end
        };
      } catch (stripeError) {
        console.log('Could not fetch Stripe subscription:', stripeError.message);
      }
    }

    return res.json({ subscription: subscriptionData });
  } catch (err) {
    console.error('Get current subscription error:', err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createSubscription,
  cancelSubscription,
  updateSubscription,
  getCurrentSubscription
};