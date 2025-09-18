import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { createAuditLog } from '../services/auditlog.service.js';

const signToken = (user) => {
	return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'dev_secret', {
		expiresIn: '7d'
	});
};



export const signup = async (req, res) => {
	try {
		const { firstName, lastName, email, password, userType, businessName } = req.body;
		const existing = await User.findOne({ email });
		if (existing) {
			// Log failed signup attempt
			await createAuditLog(`Failed signup attempt - email already registered: ${email}`, existing._id, 'warning');
			return res.status(409).json({ message: 'Email already registered' });
		}

		const passwordHash = await User.hashPassword(password);
		const role = userType === 'provider' ? 'provider' : 'client';
		const user = await User.create({ firstName, lastName, email, passwordHash, role });

		// Create provider profile if provider
		if (role === 'provider' && businessName) {
			const { default: Provider } = await import('../models/Provider.js');
			await Provider.create({ 
				user: user._id, 
				businessName, 
				category: 'Uncategorized',
				slug: businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
			});
		}

		// Log successful signup
		await createAuditLog(`User signup successful`, user._id, 'normal');

		const token = signToken(user);
		return res.status(201).json({ 
			token, 
			user: { id: user._id, role: user.role, firstName, lastName, email } 
		});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

export const signin = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });
		
		if (!user) {
			// Log failed login attempt - user not found
			await createAuditLog(`Failed login attempt - user not found: ${email}`, null, 'warning');
			return res.status(401).json({ message: 'Invalid credentials' });
		}
		
		if (!user.isActive) {
			// Log failed login attempt - account deactivated
			await createAuditLog(`Failed login attempt - account deactivated`, user._id, 'critical');
			return res.status(401).json({ message: 'Account is deactivated' });
		}
		
		const ok = await user.comparePassword(password);
		if (!ok) {
			// Log failed login attempt - wrong password
			await createAuditLog(`Failed login attempt - incorrect password`, user._id, 'warning');
			return res.status(401).json({ message: 'Invalid credentials' });
		}
		
		user.lastLogin = new Date();
		await user.save();
		
		// Log successful login
		await createAuditLog(`User login successful`, user._id, 'normal');
		
		const token = signToken(user);
		return res.json({ 
			token, 
			user: { 
				id: user._id, 
				role: user.role, 
				firstName: user.firstName, 
				lastName: user.lastName, 
				email: user.email 
			} 
		});
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

export const updateProfile = async (req, res) => {
	try {
		const { firstName, lastName, phone, profileImage } = req.body;
		const user = await User.findById(req.user.id);
		if (!user) return res.status(404).json({ message: 'User not found' });
		
		user.firstName = firstName || user.firstName;
		user.lastName = lastName || user.lastName;
		user.phone = phone || user.phone;
		user.profileImage = profileImage || user.profileImage;
		
		await user.save();
		
		// Log profile update
		await createAuditLog(`User profile updated`, user._id, 'normal');
		
		return res.json({ 
			user: { 
				id: user._id, 
				firstName: user.firstName, 
				lastName: user.lastName, 
				email: user.email, 
				phone: user.phone, 
				profileImage: user.profileImage 
			} 
		});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

export const changePassword = async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;
		const user = await User.findById(req.user.id);
		if (!user) return res.status(404).json({ message: 'User not found' });
		
		const isValidPassword = await user.comparePassword(currentPassword);
		if (!isValidPassword) {
			// Log failed password change attempt
			await createAuditLog(`Failed password change - incorrect current password`, user._id, 'warning');
			return res.status(400).json({ message: 'Current password is incorrect' });
		}
		
		user.passwordHash = await User.hashPassword(newPassword);
		await user.save();
		
		// Log successful password change
		await createAuditLog(`Password changed successfully`, user._id, 'critical');
		
		return res.json({ message: 'Password updated successfully' });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};