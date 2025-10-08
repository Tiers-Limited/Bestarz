const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe Checkout Session for booking payments
 * 
 * WHY: Checkout Sessions provide a hosted payment page, reducing PCI compliance burden
 * and handling payment authentication (3D Secure) automatically.
 * 
 * IMPORTANT: We store critical metadata here so webhooks can identify which booking to update.
 * Without metadata, webhooks cannot link Stripe events back to our database records.
 * 
 * @param {Object} booking - The booking document from database
 * @param {string} customerEmail - Client's email address
 * @param {number} amount - Amount in dollars (will be converted to cents)
 * @param {string} paymentType - 'advance' or 'final' to track payment stage
 * @returns {Object} { paymentLink, sessionId, paymentIntentId }
 */
const createPaymentLink = async (booking, customerEmail, amount, paymentType = 'advance') => {
	try {
		// ===== VALIDATION =====
		// Always validate inputs to prevent Stripe API errors and invalid data
		if (!booking || !customerEmail || !amount) {
			throw new Error('Missing required payment data');
		}

		if (amount <= 0) {
			throw new Error('Invalid payment amount');
		}

		// ===== CREATE CHECKOUT SESSION =====
		const session = await stripe.checkout.sessions.create({
			// Payment method types - 'card' is most common
			// You can add 'us_bank_account', 'alipay', etc. if needed
			payment_method_types: ['card'],
			
			// Line items - what the customer is paying for
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: {
							name: `${paymentType === 'advance' ? 'Advance' : 'Final'} Payment - ${booking.serviceCategory || 'Service'}`,
							description: `${booking.eventType || 'Event'} at ${booking.location || 'Location'} on ${booking.dateStart ? new Date(booking.dateStart).toLocaleDateString() : 'TBD'}`,
							// Optional: Add images for better UX
							// images: ['https://your-cdn.com/service-image.jpg'],
						},
						// CRITICAL: Amount must be in cents (smallest currency unit)
						// For USD: $10.00 = 1000 cents
						unit_amount: Math.round(amount * 100),
					},
					quantity: 1,
				},
			],
			
			// Mode determines payment type:
			// - 'payment': One-time payment (our case)
			// - 'subscription': Recurring payments
			// - 'setup': Save payment method for future use
			mode: 'payment',
			
			// ===== REDIRECT URLs =====
			// IMPORTANT: These should include session_id so frontend can verify payment
			success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/cancel?session_id={CHECKOUT_SESSION_ID}`,
			
			// Pre-fill customer email to reduce friction
			customer_email: customerEmail,
			
			// ===== METADATA - THE MOST IMPORTANT PART =====
			// This is how we link Stripe events back to our database
			// RULE: Store ALL IDs needed to update the correct records
			// RULE: Convert ObjectIds to strings (Stripe metadata must be strings)
			metadata: {
				bookingId: booking._id.toString(),
				paymentType: paymentType, // 'advance' or 'final'
				providerId: booking.provider?._id?.toString() || '',
				clientId: booking.client?._id?.toString() || '',
				// Optional: Add environment for debugging
				environment: process.env.NODE_ENV || 'development',
			},
			
			// ===== OPTIONAL BUT RECOMMENDED =====
			// Expire session after 24 hours (default is 24h anyway)
			expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
			
			// Allow promotion codes for discounts
			// allow_promotion_codes: true,
			
			// Collect billing address (useful for tax calculation)
			// billing_address_collection: 'required',
		});

		// Log session creation for debugging
		console.log('✅ Stripe Checkout Session created:', {
			sessionId: session.id,
			bookingId: booking._id.toString(),
			amount: amount,
			paymentType: paymentType,
		});

		return {
			paymentLink: session.url,
			sessionId: session.id,
			// Note: payment_intent is null until customer completes checkout
			paymentIntentId: session.payment_intent,
		};
	} catch (error) {
		console.error('❌ Stripe payment link creation error:', error);
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