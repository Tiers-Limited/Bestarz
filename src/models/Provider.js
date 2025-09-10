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
		rating: { type: Number, default: 0 },
		reviews: { type: Number, default: 0 },
		verified: { type: Boolean, default: false }
	},
	{ timestamps: true }
);

export default mongoose.model('Provider', providerSchema);
