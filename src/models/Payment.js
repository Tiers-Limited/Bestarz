const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
	{
		booking: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Booking',
			required: true
		},
		client: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		provider: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Provider',
			required: true
		},

		// Payment type: 'advance' (30%) or 'final' (70%)
		paymentType: {
			type: String,
			enum: ['advance', 'final'],
			required: true
		},

		// Total booking amount
		totalAmount: {
			type: Number,
			required: true
		},

		// Amount for this specific payment (30% or 70%)
		amount: {
			type: Number,
			required: true
		},

		// Platform fee (20% of amount)
		platformFee: {
			type: Number,
			required: true
		},

		// Provider earnings (80% of amount)
		providerEarnings: {
			type: Number,
			required: true
		},

		paymentMethod: {
			type: String,
			default: 'stripe'
		},

		status: {
			type: String,
			enum: ['pending', 'completed', 'failed', 'refunded'],
			default: 'pending'
		},

		stripePaymentIntentId: { type: String },
		transactionId: { type: String },

		// Transfer tracking
		transferredToProvider: {
			type: Boolean,
			default: false
		},
		stripeTransferId: { type: String },
		transferredAt: { type: Date },

		processedAt: { type: Date },

		// Refund information
		refundAmount: { type: Number },
		refundReason: { type: String },
		refundId: { type: String },
		refundedAt: { type: Date }
	},
	{ timestamps: true }
);

// Index for faster queries
paymentSchema.index({ booking: 1, paymentType: 1 });
paymentSchema.index({ client: 1, status: 1 });
paymentSchema.index({ provider: 1, status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);