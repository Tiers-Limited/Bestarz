const mongoose = require('mongoose');
require('dotenv').config();

async function checkSubscriptions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = require('./src/models/User.js');
    const users = await User.find({ role: 'provider' }).select('firstName lastName email subscriptionPlan subscriptionStatus subscriptionEnd stripeSubscriptionId stripeCustomerId');

    console.log('\n=== PROVIDER SUBSCRIPTIONS ===');
    users.forEach(user => {
      console.log(`Name: ${user.firstName} ${user.lastName}`);
      console.log(`Email: ${user.email}`);
      console.log(`Plan: ${user.subscriptionPlan || 'None'}`);
      console.log(`Status: ${user.subscriptionStatus || 'N/A'}`);
      console.log(`End Date: ${user.subscriptionEnd ? new Date(user.subscriptionEnd).toLocaleDateString() : 'N/A'}`);
      console.log(`Stripe Subscription ID: ${user.stripeSubscriptionId || 'N/A'}`);
      console.log(`Stripe Customer ID: ${user.stripeCustomerId || 'N/A'}`);
      console.log('---');
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSubscriptions();