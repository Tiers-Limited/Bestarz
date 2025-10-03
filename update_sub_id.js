const mongoose = require('mongoose');
require('dotenv').config();

async function updateSubscriptionId() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = require('./src/models/User.js');

    // Update the user with the latest subscription ID
    const result = await User.updateOne(
      { email: 'shahbazrafique429@gmail.com' },
      {
        stripeSubscriptionId: 'sub_1SE5N4A80LwJDb13pYtGzbe3',
        subscriptionEnd: new Date('2025-11-03T09:33:50.000Z')
      }
    );

    console.log('Update result:', result);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

updateSubscriptionId();