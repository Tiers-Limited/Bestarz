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

/**
 * Create a Stripe Checkout Session for subscription payments
 * 
 * @param {string} userId - User ID to store in metadata
 * @param {string} customerEmail - User's email
 * @param {string} planType - 'starter', 'professional', or 'enterprise'
 * @returns {Object} { sessionId, paymentLink }
 */
const createSubscriptionCheckout = async (userId, customerEmail, planType) => {
	try {
		console.log('🔧 Creating subscription checkout:', { userId, customerEmail, planType });
		
		// Validate Stripe configuration
		if (!process.env.STRIPE_SECRET_KEY) {
			throw new Error('STRIPE_SECRET_KEY not configured');
		}
		
		// Define plan pricing (for dynamic price creation)
		const PLAN_CONFIGS = {
			starter: { amount: 2900, name: 'Starter Plan' }, // $29.00
			professional: { amount: 6900, name: 'Professional Plan' }, // $69.00
			enterprise: { amount: 14900, name: 'Enterprise Plan' } // $149.00
		};

		const planConfig = PLAN_CONFIGS[planType.toLowerCase()];
		if (!planConfig) {
			throw new Error(`Invalid plan type: ${planType}`);
		}
		
		console.log('📋 Using plan config:', planConfig);

		// Create or retrieve customer
		let customer;
		try {
			const customers = await stripe.customers.list({
				email: customerEmail,
				limit: 1
			});
			customer = customers.data[0];
		} catch (error) {
			console.log('Error finding customer:', error.message);
		}

		if (!customer) {
			customer = await stripe.customers.create({
				email: customerEmail,
				metadata: {
					userId: userId
				}
			});
		}

		// Create checkout session for subscription with dynamic pricing
		const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
		console.log('🌐 Frontend URL:', frontendUrl);
		
		// CRITICAL: Ensure userId is a string for metadata
		const userIdString = userId.toString();
		
		console.log('📝 Creating session with metadata:', {
			userId: userIdString,
			planType: planType,
			customerId: customer.id
		});
		
		const session = await stripe.checkout.sessions.create({
			customer: customer.id,
			payment_method_types: ['card'],
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: {
							name: planConfig.name,
							description: `Monthly subscription to ${planConfig.name}`,
						},
						unit_amount: planConfig.amount,
						recurring: {
							interval: 'month',
						},
					},
					quantity: 1,
				},
			],
			mode: 'subscription',
			success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${frontendUrl}/provider/subscription`,
			// CRITICAL: Session metadata for webhook access
			metadata: {
				userId: userIdString,
				planType: planType.toLowerCase()
			},
			// CRITICAL: Subscription metadata for ongoing management
			subscription_data: {
				metadata: {
					userId: userIdString,
					planType: planType.toLowerCase()
				}
			}
		});

		console.log('✅ Subscription Checkout Session created:', {
			sessionId: session.id,
			customerId: customer.id,
			planType,
			userId
		});

		return {
			sessionId: session.id,
			paymentLink: session.url,
			customerId: customer.id
		};

	} catch (error) {
		console.error('❌ Subscription checkout creation error:', error);
		throw new Error(`Failed to create subscription checkout: ${error.message}`);
	}
};

/**
 * Cancel a Stripe subscription
 * 
 * @param {string} subscriptionId - Stripe subscription ID
 * @param {boolean} immediate - Cancel immediately or at period end
 * @returns {Object} Updated subscription object
 */
const cancelSubscription = async (subscriptionId, immediate = false) => {
	try {
		if (immediate) {
			// Cancel immediately
			const subscription = await stripe.subscriptions.cancel(subscriptionId);
			console.log('✅ Subscription canceled immediately:', subscriptionId);
			return subscription;
		} else {
			// Cancel at period end
			const subscription = await stripe.subscriptions.update(subscriptionId, {
				cancel_at_period_end: true
			});
			console.log('✅ Subscription set to cancel at period end:', subscriptionId);
			return subscription;
		}
	} catch (error) {
		console.error('❌ Subscription cancellation error:', error);
		throw new Error(`Failed to cancel subscription: ${error.message}`);
	}
};

/**
 * Retrieve subscription details from Stripe
 * 
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Object} Subscription object
 */
const getSubscription = async (subscriptionId) => {
	try {
		const subscription = await stripe.subscriptions.retrieve(subscriptionId);
		return subscription;
	} catch (error) {
		console.error('❌ Subscription retrieval error:', error);
		throw new Error(`Failed to retrieve subscription: ${error.message}`);
	}
};

module.exports = {
	createPaymentLink,
	retrieveSession,
	transferToConnectedAccount,
	getAccountBalance,
	getConnectedAccount,
	createAccountLink,
	// New subscription functions
	createSubscriptionCheckout,
	cancelSubscription,
	getSubscription,
};