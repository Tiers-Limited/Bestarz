import Provider from '../models/Provider.js';

export const listProviders = async (req, res) => {
	try {
		const { category, location, minPrice, maxPrice } = req.query;
		const filter = {};
		if (category) filter.category = category;
		if (location) filter.location = new RegExp(location, 'i');
		if (minPrice || maxPrice) filter.basePrice = {};
		if (minPrice) filter.basePrice.$gte = Number(minPrice);
		if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
		const providers = await Provider.find(filter).limit(50);
		return res.json({ providers });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

export const getProvider = async (req, res) => {
	try {
		const provider = await Provider.findById(req.params.id);
		if (!provider) return res.status(404).json({ message: 'Provider not found' });
		return res.json({ provider });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

export const upsertMyProviderProfile = async (req, res) => {
	try {
		const userId = req.user.id;
		const update = req.body;
		const provider = await Provider.findOneAndUpdate(
			{ user: userId },
			{ $set: update },
			{ new: true, upsert: true }
		);
		return res.json({ provider });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};
