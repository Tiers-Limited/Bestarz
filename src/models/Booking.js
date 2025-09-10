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
		budgetMin: { type: Number },
		budgetMax: { type: Number },
		description: { type: String },
		status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' }
	},
	{ timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);
