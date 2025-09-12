import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
	{
		booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
		client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
		rating: { type: Number, required: true, min: 1, max: 5 },
		comment: { type: String },
		isVerified: { type: Boolean, default: false }
	},
	{ timestamps: true }
);

// Ensure one review per booking
reviewSchema.index({ booking: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
