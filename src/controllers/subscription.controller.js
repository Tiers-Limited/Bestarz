const User = require('../models/User');
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { createSubscriptionCheckout, cancelSubscription, getSubscription } = require('../services/stripe.service');

/**
 * Create Stripe Checkout Session for subscription
 * POST /api/subscription/create-checkout
 */
const createCheckoutSession = async (req, res) => {
	try {
		const userId = req.user.id;
		const { planType } = req.body;

		console.log('📋 Creating subscription checkout:', { userId, planType });

		// Validate plan type
		const validPlans = ['starter', 'professional', 'enterprise'];
		if (!planType || !validPlans.includes(planType.toLowerCase())) {
			return res.status(400).json({ 
				message: 'Invalid plan type. Must be starter, professional, or enterprise.' 
			});
		}

		// Get user details
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Check if user already has active subscription
		if (user.subscriptionStatus === 'active' && user.stripeSubscriptionId) {
			return res.status(400).json({ 
				message: 'You already have an active subscription. Please cancel it first to change plans.' 
			});
		}

		// Create Stripe checkout session
		const { sessionId, paymentLink, customerId } = await createSubscriptionCheckout(
			userId,
			user.email,
			planType
		);

		// Update user's Stripe customer ID if not already set
		if (!user.stripeCustomerId) {
			await User.findByIdAndUpdate(userId, { stripeCustomerId: customerId });
		}

		console.log('✅ Subscription checkout session created successfully');

		res.status(201).json({
			success: true,
			sessionId,
			paymentLink,
			message: 'Checkout session created successfully'
		});

	} catch (error) {
		console.error('❌ Create checkout session error:', error);
		console.error('Error stack:', error.stack);
		res.status(500).json({ 
			message: 'Failed to create checkout session',
			error: error.message,
			details: process.env.NODE_ENV === 'development' ? error.stack : undefined
		});
	}
};

/**
 * Get current subscription status
 * GET /api/subscription/status
 */
const getSubscriptionStatus = async (req, res) => {
	try {
		const userId = req.user.id;
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		console.log('📊 Getting subscription status for user:', userId);

		// Basic subscription data from database
		const subscriptionData = {
			subscriptionPlan: user.subscriptionPlan || 'none',
			subscriptionStatus: user.subscriptionStatus || 'canceled',
			stripeSubscriptionId: user.stripeSubscriptionId,
			stripeCustomerId: user.stripeCustomerId,
			subscriptionStart: user.subscriptionStart,
			subscriptionEnd: user.subscriptionEnd,
			currentPeriodStart: user.currentPeriodStart,
			currentPeriodEnd: user.currentPeriodEnd,
			cancelAtPeriodEnd: user.cancelAtPeriodEnd,
			stripePriceId: user.stripePriceId,
			hasActiveSubscription: user.subscriptionStatus === 'active'
		};

		// If user has active Stripe subscription, get latest details from Stripe
		if (user.stripeSubscriptionId && user.subscriptionStatus === 'active') {
			try {
				const stripeSubscription = await getSubscription(user.stripeSubscriptionId);
				if (stripeSubscription) {
					subscriptionData.stripeDetails = {
						id: stripeSubscription.id,
						status: stripeSubscription.status,
						current_period_start: new Date(stripeSubscription.current_period_start * 1000),
						current_period_end: new Date(stripeSubscription.current_period_end * 1000),
						cancel_at_period_end: stripeSubscription.cancel_at_period_end,
						plan: stripeSubscription.items?.data[0]?.price?.nickname || 'Unknown'
					};
				}
			} catch (stripeError) {
				console.log('⚠️ Could not fetch Stripe subscription details:', stripeError.message);
			}
		}

		console.log('✅ Subscription status retrieved successfully');

		res.status(200).json({
			success: true,
			subscription: subscriptionData
		});

	} catch (error) {
		console.error('❌ Get subscription status error:', error);
		res.status(500).json({ 
			message: 'Failed to get subscription status',
			error: error.message 
		});
	}
};

/**
 * Cancel user subscription
 * POST /api/subscription/cancel
 */
const cancelUserSubscription = async (req, res) => {
	try {
		const userId = req.user.id;
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		console.log('🚫 Canceling subscription for user:', userId);

		// If no active subscription
		if (user.subscriptionStatus !== 'active' || !user.stripeSubscriptionId) {
			return res.status(400).json({ 
				message: 'No active subscription found to cancel' 
			});
		}

		// Cancel subscription in Stripe
		const canceledSubscription = await cancelSubscription(user.stripeSubscriptionId);

		// Update user subscription status in database
		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{
				subscriptionStatus: 'canceled_pending', // Will be canceled at period end
				cancelAtPeriodEnd: true,
				updatedAt: new Date()
			},
			{ new: true }
		);

		console.log('✅ Subscription canceled successfully');

		res.status(200).json({
			success: true,
			message: 'Subscription will be canceled at the end of the current billing period',
			subscription: {
				status: updatedUser.subscriptionStatus,
				cancelAtPeriodEnd: updatedUser.cancelAtPeriodEnd,
				currentPeriodEnd: updatedUser.currentPeriodEnd
			}
		});

	} catch (error) {
		console.error('❌ Cancel subscription error:', error);
		res.status(500).json({ 
			message: 'Failed to cancel subscription',
			error: error.message 
		});
	}
};

/**
 * Verify subscription session (after payment)
 * POST /api/subscription/verify-session
 */
const verifySubscriptionSession = async (req, res) => {
	try {
		const { sessionId } = req.body;
		const userId = req.user.id;

		if (!sessionId) {
			return res.status(400).json({ message: 'Session ID is required' });
		}

		console.log('🔍 Verifying subscription session:', { sessionId, userId });

		// Get session details from Stripe
		const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
		const session = await stripe.checkout.sessions.retrieve(sessionId);

		if (session.payment_status !== 'paid') {
			return res.status(400).json({ 
				message: 'Payment not completed',
				paymentStatus: session.payment_status 
			});
		}

		// Get user and update subscription status
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Get subscription details from Stripe
		if (session.subscription) {
			const subscription = await stripe.subscriptions.retrieve(session.subscription);
			
			// Update user with subscription details
			const updatedUser = await User.findByIdAndUpdate(
				userId,
				{
					subscriptionStatus: 'active',
					subscriptionPlan: session.metadata?.planType || 'professional',
					stripeSubscriptionId: subscription.id,
					stripeCustomerId: session.customer,
					stripePriceId: subscription.items.data[0].price.id,
					subscriptionStart: new Date(subscription.current_period_start * 1000),
					subscriptionEnd: new Date(subscription.current_period_end * 1000),
					currentPeriodStart: new Date(subscription.current_period_start * 1000),
					currentPeriodEnd: new Date(subscription.current_period_end * 1000),
					cancelAtPeriodEnd: false,
					updatedAt: new Date()
				},
				{ new: true }
			);

			console.log('✅ Subscription verified and activated successfully');

			res.status(200).json({
				success: true,
				message: 'Subscription activated successfully',
				// Include original session metadata for frontend fallback logic
				metadata: session.metadata,
				subscription: {
					plan: updatedUser.subscriptionPlan,
					status: updatedUser.subscriptionStatus,
					subscriptionId: updatedUser.stripeSubscriptionId,
					currentPeriodEnd: updatedUser.currentPeriodEnd
				}
			});
		} else {
			return res.status(400).json({ 
				message: 'No subscription found in session' 
			});
		}

	} catch (error) {
		console.error('❌ Verify subscription session error:', error);
		res.status(500).json({ 
			message: 'Failed to verify subscription session',
			error: error.message 
		});
	}
};

// ✅ Manual subscription update for successful payments (backup for webhook failures)
const updateSubscriptionManually = async (req, res) => {
	try {
		const userId = req.user.id;
		const { sessionId, planType } = req.body;

		console.log('🔧 Manual subscription update requested:', { userId, sessionId, planType });

		if (!sessionId || !planType) {
			return res.status(400).json({ 
				message: 'Session ID and plan type are required' 
			});
		}

		// Verify the session was actually paid
		let session;
		try {
			session = await stripe.checkout.sessions.retrieve(sessionId);
			console.log('📋 Retrieved session:', {
				id: session.id,
				payment_status: session.payment_status,
				customer: session.customer,
				metadata: session.metadata
			});
		} catch (error) {
			console.error('❌ Failed to retrieve session:', error.message);
			return res.status(400).json({ message: 'Invalid session ID' });
		}

		// Verify payment was successful
		if (session.payment_status !== 'paid') {
			console.log('❌ Session payment not completed:', session.payment_status);
			return res.status(400).json({ message: 'Payment not completed for this session' });
		}

		// Verify metadata matches
		if (session.metadata.userId !== userId || session.metadata.planType !== planType) {
			console.log('❌ Session metadata mismatch:', {
				sessionUserId: session.metadata.userId,
				requestUserId: userId,
				sessionPlanType: session.metadata.planType,
				requestPlanType: planType
			});
			return res.status(400).json({ message: 'Session data does not match request' });
		}

		// Update user subscription
		const now = new Date();
		const subscriptionEnd = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now

		const updateData = {
			subscriptionStatus: 'active',
			subscriptionPlan: planType,
			stripeSubscriptionId: session.subscription || `manual_${session.id}`,
			stripeCustomerId: session.customer,
			subscriptionStart: now,
			subscriptionEnd: subscriptionEnd,
			cancelAtPeriodEnd: false,
			updatedAt: now
		};

		console.log('📝 Updating user subscription:', updateData);

		const updatedUser = await User.findByIdAndUpdate(
			userId,
			updateData,
			{ new: true, runValidators: true }
		);

		if (!updatedUser) {
			console.error('❌ User not found:', userId);
			return res.status(404).json({ message: 'User not found' });
		}

		console.log('✅ Subscription updated manually:', {
			userId: updatedUser._id,
			subscriptionStatus: updatedUser.subscriptionStatus,
			subscriptionPlan: updatedUser.subscriptionPlan,
			subscriptionEnd: updatedUser.subscriptionEnd
		});

		// Return the updated subscription status
		res.json({
			success: true,
			message: 'Subscription activated successfully',
			subscription: {
				subscriptionStatus: updatedUser.subscriptionStatus,
				subscriptionPlan: updatedUser.subscriptionPlan,
				stripeSubscriptionId: updatedUser.stripeSubscriptionId,
				stripeCustomerId: updatedUser.stripeCustomerId,
				subscriptionStart: updatedUser.subscriptionStart,
				subscriptionEnd: updatedUser.subscriptionEnd,
				cancelAtPeriodEnd: updatedUser.cancelAtPeriodEnd
			}
		});

	} catch (error) {
		console.error('❌ Manual subscription update error:', error);
		res.status(500).json({ 
			message: 'Failed to update subscription',
			error: error.message 
		});
	}
};

module.exports = {
	createCheckoutSession,
	getSubscriptionStatus,
	cancelUserSubscription,
	verifySubscriptionSession,
	updateSubscriptionManually
};