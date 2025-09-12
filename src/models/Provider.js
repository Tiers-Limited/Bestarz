import mongoose from 'mongoose';

const providerSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
		businessName: { type: String, required: true },
		category: { type: String, required: true },
		description: { type: String },
		basePrice: { type: Number, default: 0 },
		location: { type: String },
		phone: { type: String },
		email: { type: String },
		website: { type: String },
		services: [{ type: String }],
		availability: [{ type: String }],
		portfolio: [{ type: String }],
		profileImage: { type: String },
		rating: { type: Number, default: 0 },
		reviews: { type: Number, default: 0 },
		verified: { type: Boolean, default: false },
		isActive: { type: Boolean, default: true },
		responseTime: { type: String, default: '2 hours' },
		bookingRate: { type: String, default: '95%' },
		slug: { type: String, unique: true, sparse: true } // For public URLs like /provider/dj-master/book
	},
	{ timestamps: true }
);

export default mongoose.model('Provider', providerSchema);
