const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
	{
		booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
		client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
		amount: { type: Number, required: true },
		currency: { type: String, default: 'USD' },
		status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
		paymentMethod: { type: String, enum: ['stripe', 'paypal', 'bank_transfer'], default: 'stripe' },
		transactionId: { type: String, unique: true, sparse: true },
		stripePaymentIntentId: { type: String },
		refundId: { type: String },
		refundAmount: { type: Number },
		refundReason: { type: String },
		processedAt: { type: Date },
		refundedAt: { type: Date }
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
