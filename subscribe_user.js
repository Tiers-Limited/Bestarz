const mongoose = require('mongoose');
require('dotenv').config();

async function checkAndSubscribeUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = require('./src/models/User.js');

    // Check if user exists
    const user = await User.findOne({ email: 'duderustamkhawar@gmail.com' });
    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('User found:', {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      currentSubscription: {
        plan: user.subscriptionPlan,
        status: user.subscriptionStatus,
        end: user.subscriptionEnd
      }
    });

    // Subscribe the user (set to Professional plan)
    const result = await User.updateOne(
      { email: 'duderustamkhawar@gmail.com' },
      {
        subscriptionPlan: 'professional',
        subscriptionStatus: 'active',
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        stripeSubscriptionId: 'test_sub_' + Date.now(), // Dummy ID for testing
        stripeCustomerId: user.stripeCustomerId || 'cus_test_' + Date.now()
      }
    );

    console.log('Subscription update result:', result);

    // Verify the update
    const updatedUser = await User.findOne({ email: 'duderustamkhawar@gmail.com' }, {
      firstName: 1, lastName: 1, email: 1, subscriptionPlan: 1, subscriptionStatus: 1, subscriptionEnd: 1
    });

    console.log('Updated user:', updatedUser);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAndSubscribeUser();