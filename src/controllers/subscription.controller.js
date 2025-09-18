// controllers/subscription.controller.js
import User from '../models/User.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Create subscription with raw amount
export const createSubscription = async (req, res) => {
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


export const cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.stripeSubscriptionId) {
      return res.status(400).json({ message: 'No active subscription found' });
    }

    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true // recurring but cancel at end
    });

    user.subscriptionStatus = 'canceled';
    await user.save();

    return res.json({ message: 'Subscription canceled', user });
  } catch (err) {
    console.error('Cancel subscription error:', err);
    return res.status(500).json({ message: err.message });
  }
};


export const updateSubscription = async (req, res) => {
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


