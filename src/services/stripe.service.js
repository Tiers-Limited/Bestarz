import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentLink = async (booking, clientEmail) => {
	try {
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: {
							name: `${booking.serviceCategory} - ${booking.eventType}`,
							description: `Booking for ${booking.eventType} on ${booking.dateStart}`,
						},
						unit_amount: booking.amount * 100, // Convert to cents
					},
					quantity: 1,
				},
			],
			mode: 'payment',
			success_url: `${process.env.FRONTEND_URL}/client/payments?success=true&session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.FRONTEND_URL}/client/payments?canceled=true`,
			customer_email: clientEmail,
			metadata: {
				bookingId: booking._id.toString(),
				providerId: booking.provider.toString(),
				clientId: booking.client.toString(),
			},
		});

		return {
			paymentLink: session.url,
			sessionId: session.id,
		};
	} catch (error) {
		console.error('Stripe error:', error);
		throw new Error('Failed to create payment link');
	}
};

export const retrieveSession = async (sessionId) => {
	try {
		const session = await stripe.checkout.sessions.retrieve(sessionId);
		return session;
	} catch (error) {
		console.error('Stripe retrieve error:', error);
		throw new Error('Failed to retrieve payment session');
	}
};

export const createStripeRefund = async (paymentIntentId, amount) => {
	try {
		const refund = await stripe.refunds.create({
			payment_intent: paymentIntentId,
			amount: amount * 100, // Convert to cents
		});
		return refund;
	} catch (error) {
		console.error('Stripe refund error:', error);
		throw new Error('Failed to create refund');
	}
};

export const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
	try {
		const paymentIntent = await stripe.paymentIntents.create({
			amount: amount * 100, // Convert to cents
			currency,
			metadata,
		});
		return paymentIntent;
	} catch (error) {
		console.error('Stripe payment intent error:', error);
		throw new Error('Failed to create payment intent');
	}
};
