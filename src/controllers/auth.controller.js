import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (user) => {
	return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'dev_secret', {
		expiresIn: '7d'
	});
};

export const signup = async (req, res) => {
	try {
		const { firstName, lastName, email, password, userType, businessName } = req.body;
		const existing = await User.findOne({ email });
		if (existing) return res.status(409).json({ message: 'Email already registered' });

		const passwordHash = await User.hashPassword(password);
		const role = userType === 'provider' ? 'provider' : 'client';
		const user = await User.create({ firstName, lastName, email, passwordHash, role });

		// Optionally create provider profile shell if provider
		if (role === 'provider' && businessName) {
			const { default: Provider } = await import('../models/Provider.js');
			await Provider.create({ user: user._id, businessName, category: 'Uncategorized' });
		}

		const token = signToken(user);
		return res.status(201).json({ token, user: { id: user._id, role: user.role, firstName, lastName, email } });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

export const signin = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });
		if (!user) return res.status(401).json({ message: 'Invalid credentials' });
		const ok = await user.comparePassword(password);
		if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
		const token = signToken(user);
		return res.json({ token, user: { id: user._id, role: user.role, firstName: user.firstName, lastName: user.lastName, email: user.email } });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

export const me = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-passwordHash');
		if (!user) return res.status(404).json({ message: 'User not found' });
		return res.json({ user });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};
