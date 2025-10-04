const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create payment link for booking
const createPaymentLink = async (booking, customerEmail, amount, paymentType = 'advance') => {
	try {
		// Validate required data
		if (!booking || !customerEmail || !amount) {
			throw new Error('Missing required payment data');
		}

		if (amount <= 0) {
			throw new Error('Invalid payment amount');
		}

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: {
							name: `${paymentType === 'advance' ? 'Advance' : 'Final'} Payment - ${booking.serviceCategory || 'Service'}`,
							description: `${booking.eventType || 'Event'} at ${booking.location || 'Location'} on ${booking.dateStart ? new Date(booking.dateStart).toLocaleDateString() : 'TBD'}`,
						},
						unit_amount: Math.round(amount * 100), // Convert to cents
					},
					quantity: 1,
				},
			],
			mode: 'payment',
			success_url: `${process.env.FRONTEND_URL}/success`,
			cancel_url: `${process.env.FRONTEND_URL}/cancel`,
			customer_email: customerEmail,
			metadata: {
				bookingId: booking._id.toString(),
				paymentType: paymentType,
				providerId: booking.provider?._id?.toString() || '',
				clientId: booking.client?._id?.toString() || '',
			},
		});

		return {
			paymentLink: session.url,
			sessionId: session.id,
		};
	} catch (error) {
		console.error('Stripe payment link creation error:', error);
		throw new Error(`Failed to create payment link: ${error.message}`);
	}
};

// Retrieve session details
const retrieveSession = async (sessionId) => {
	try {
		const session = await stripe.checkout.sessions.retrieve(sessionId);
		return session;
	} catch (error) {
		console.error('Stripe session retrieval error:', error);
		throw new Error('Failed to retrieve session');
	}
};

// Transfer funds to connected account (provider gets 80%)
const transferToConnectedAccount = async (accountId, amount, sourceTransaction, description) => {
	try {
		const transfer = await stripe.transfers.create({
			amount: Math.round(amount * 100), // Convert to cents
			currency: 'usd',
			destination: accountId,
			source_transaction: sourceTransaction,
			description: description,
		});
		return transfer;
	} catch (error) {
		console.error('Stripe transfer error:', error);
		throw new Error('Failed to transfer funds to provider');
	}
};

// Get account balance
const getAccountBalance = async () => {
	try {
		const balance = await stripe.balance.retrieve();
		return balance;
	} catch (error) {
		console.error('Stripe balance retrieval error:', error);
		throw new Error('Failed to retrieve account balance');
	}
};

// Get connected account details
const getConnectedAccount = async (accountId) => {
	try {
		const account = await stripe.accounts.retrieve(accountId);
		return account;
	} catch (error) {
		console.error('Stripe account retrieval error:', error);
		throw new Error('Failed to retrieve connected account');
	}
};

// Create account link for onboarding
const createAccountLink = async (accountId, refreshUrl, returnUrl) => {
	try {
		const accountLink = await stripe.accountLinks.create({
			account: accountId,
			refresh_url: refreshUrl,
			return_url: returnUrl,
			type: 'account_onboarding',
		});
		return accountLink;
	} catch (error) {
		console.error('Stripe account link creation error:', error);
		throw new Error('Failed to create account link');
	}
};

module.exports = {
	createPaymentLink,
	retrieveSession,
	transferToConnectedAccount,
	getAccountBalance,
	getConnectedAccount,
	createAccountLink,
};