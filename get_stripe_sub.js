const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function getCustomerSubscriptions() {
  try {
    const customerId = 'cus_TAQ2K6BL8HcrGM'; // From the database

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active'
    });

    console.log('Active subscriptions for customer:', customerId);
    subscriptions.data.forEach(sub => {
      console.log('Subscription ID:', sub.id);
      console.log('Status:', sub.status);
      console.log('Current period end:', new Date(sub.current_period_end * 1000));
      console.log('---');
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

getCustomerSubscriptions();