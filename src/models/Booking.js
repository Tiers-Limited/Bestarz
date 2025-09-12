import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
	{
		client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
		serviceCategory: { type: String, required: true },
		eventType: { type: String },
		location: { type: String },
		guests: { type: String },
		dateStart: { type: Date },
		dateEnd: { type: Date },
		eventTime: { type: String },
		duration: { type: Number }, // in hours
		budgetMin: { type: Number },
		budgetMax: { type: Number },
		description: { type: String },
		contactInfo: { type: String },
		status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
		amount: { type: Number },
		paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
		notes: { type: String }
	},
	{ timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);
