import mongoose from 'mongoose';

const rateCardSchema = new mongoose.Schema(
	{
		provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
		serviceName: { type: String, required: true },
		description: { type: String },
		basePrice: { type: Number, required: true },
		duration: { type: String, required: true }, // e.g., "4 hours", "Full day"
		includes: [{ type: String }], // What's included in the service
		addOns: [{
			name: { type: String, required: true },
			price: { type: Number, required: true },
			description: { type: String }
		}],
		category: { type: String, required: true },
		isActive: { type: Boolean, default: true },
		minimumBooking: { type: Number, default: 1 }, // Minimum hours/days
		maximumBooking: { type: Number }, // Maximum hours/days
		advanceBookingRequired: { type: Number, default: 7 }, // Days in advance
		cancellationPolicy: { type: String },
		depositRequired: { type: Number, default: 0 }, // Deposit amount
		depositPercentage: { type: Number, default: 0 } // Deposit as percentage
	},
	{ timestamps: true }
);

export default mongoose.model('RateCard', rateCardSchema);
