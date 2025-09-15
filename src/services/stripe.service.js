import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentLink = async (booking, clientEmail) => {
	try {
		// Extract only the necessary client information and ensure it's within character limits
		const clientId = booking.client._id ? booking.client._id.toString() : booking.client.toString();
		const providerId = booking.provider._id ? booking.provider._id.toString() : booking.provider.toString();
		const bookingId = booking._id.toString();
		
		// Create metadata with only essential information (keeping well under 500 chars per value)
		const metadata = {
			bookingId: bookingId,
			providerId: providerId,
			clientId: clientId,
			serviceCategory: booking.serviceCategory || '',
			eventType: booking.eventType || ''
		};

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: {
							name: `${booking.serviceCategory} - ${booking.eventType}`,
							description: `Booking for ${booking.eventType} on ${new Date(booking.dateStart).toLocaleDateString()}`,
						},
						unit_amount: booking.amount * 100, // Convert to cents
					},
					quantity: 1,
				},
			],
			mode: 'payment',
			success_url: `${process.env.FRONTEND_URL}/success`,
			cancel_url: `${process.env.FRONTEND_URL}/cancel`,
			customer_email: clientEmail,
			metadata: metadata,
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
		// Validate metadata to ensure each value is under 500 characters
		const validatedMetadata = {};
		Object.keys(metadata).forEach(key => {
			const value = String(metadata[key]);
			if (value.length <= 500) {
				validatedMetadata[key] = value;
			} else {
				// Truncate or skip values that are too long
				console.warn(`Metadata value for key '${key}' is too long (${value.length} chars), truncating to 500 chars`);
				validatedMetadata[key] = value.substring(0, 500);
			}
		});

		const paymentIntent = await stripe.paymentIntents.create({
			amount: amount * 100, // Convert to cents
			currency,
			metadata: validatedMetadata,
		});
		return paymentIntent;
	} catch (error) {
		console.error('Stripe payment intent error:', error);
		throw new Error('Failed to create payment intent');
	}
};