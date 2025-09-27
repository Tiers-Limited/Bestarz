const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const Provider = require('../models/Provider.js');
const AuditLog = require('../models/AuditLog.js');
const { createAuditLog } = require('../services/auditlog.service.js');
const crypto = require("crypto");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const { transporter } = require("../config/nodemailer.js");
const verificationEmailTemplate = require('../templates/verificationEmailTemplate.js');
const resetPasswordEmailTemplate = require('../templates/resetPasswordEmailTemplate.js');


const signToken = (user) => {
	return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'dev_secret', {
		expiresIn: '7d'
	});
};

// utility to generate a unique slug
async function generateUniqueSlug(Provider, baseName) {
	const baseSlug = baseName
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	let slug = baseSlug;
	let counter = 1;

	while (await Provider.findOne({ slug })) {
		slug = `${baseSlug}-${counter++}`;
	}

	return slug;
}

const signup = async (req, res) => {
	try {
		const { firstName, lastName, email, password, userType, businessName } = req.body;

		// Check if email already exists
		const existing = await User.findOne({ email });
		if (existing) {
			await createAuditLog(
				`Failed signup attempt - email already registered: ${email}`,
				existing._id,
				"warning"
			);
			return res.status(409).json({ message: "Email already registered" });
		}

		const passwordHash = await User.hashPassword(password);
		const role = userType === "provider" ? "provider" : userType === "admin" ? "admin" : "client";

		// client accounts inactive until email verification, others active
		const isActive = role === "client" ? false : true;

		let user = await User.create({
			firstName,
			lastName,
			email,
			passwordHash,
			role,
			isActive,
		});

		// If Client → create Stripe Customer
		if (role === "client") {
			const customer = await stripe.customers.create({
				email,
				name: `${firstName} ${lastName}`,
			});
			user.stripeCustomerId = customer.id;
		}

		// If Provider or Admin → create Stripe Connect Account
		if (role === "provider" || role === "admin") {
			const account = await stripe.accounts.create({
				type: "express",
				country: "US",
				email,
				capabilities: {
					transfers: { requested: true },
				},
			});
			user.stripeAccountId = account.id;
		}

		// Save user with updated stripe IDs
		await user.save();

		// If provider, create Provider profile
		if (role === "provider" && businessName) {
			const slug = await generateUniqueSlug(Provider, businessName);

			await Provider.create({
				user: user._id,
				businessName,
				category: "Uncategorized",
				slug,
			});
		}

		// Create verification link with userId
		const verifyLink = `${process.env.BACKEND_URL}/api/auth/verify-email?id=${user._id}`;

		// Send verification email
		await transporter.sendMail({
			from: `"Best★rz" <${process.env.EMAIL}>`,
			to: email,
			subject: "Verify your email - Best★rz",
			html: verificationEmailTemplate(firstName, verifyLink),
		});

		await createAuditLog(
			`User signup successful - verification email sent`,
			user._id,
			"normal"
		);

		return res.status(201).json({
			message: "Account created successfully! Please check your email to verify your account.",
		});
	} catch (err) {
		// Handle duplicate key error
		if (err.code === 11000) {
			if (err.keyPattern?.businessName) {
				return res
					.status(409)
					.json({ message: "Business name already taken. Please choose another." });
			}
			if (err.keyPattern?.email) {
				return res.status(409).json({ message: "Email already registered" });
			}
		}
		console.error("Signup error:", err);
		return res.status(500).json({ message: "Something went wrong. Please try again later." });
	}
};


const signin = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });

		if (!user) {
			await createAuditLog(
				`Failed login attempt - user not found: ${email}`,
				null,
				"warning"
			);
			return res.status(401).json({ message: "Invalid credentials" });
		}

		if (!user.isActive) {
			await createAuditLog(
				`Failed login attempt - account pending verification`,
				user._id,
				"critical"
			);
			return res
				.status(401)
				.json({ message: "Account is pending verification" });
		}

		const ok = await user.comparePassword(password);
		if (!ok) {
			await createAuditLog(
				`Failed login attempt - incorrect password`,
				user._id,
				"warning"
			);
			return res.status(401).json({ message: "Invalid credentials" });
		}

		user.lastLogin = new Date();
		await user.save();

		await createAuditLog(`User login successful`, user._id, "normal");

		// 🔑 Generate JWT token
		const token = signToken(user);

		// 🟢 If user is a provider, fetch provider profile
		let providerData = null;
		if (user.role === "provider") {
			providerData = await Provider.findOne({ user: user._id }).select("slug");
		}

		return res.json({
			token,
			user: {
				id: user._id,
				role: user.role,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				isActive: user.isActive,
				profileImage: user.profileImage,
				phone: user.phone,
				...(providerData ? { slug: providerData.slug } : {}), // add slug only if provider
			},
		});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};


const me = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-passwordHash');
		if (!user) return res.status(404).json({ message: 'User not found' });
		return res.json({ user });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

const updateProfile = async (req, res) => {
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

const changePassword = async (req, res) => {
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


const verifyEmail = async (req, res) => {
	try {
		const { id } = req.query;
		const user = await User.findById(id);

		if (!user) {
			return res.status(404).send("User not found");
		}

		if (user.isActive) {
			return res.redirect(`${process.env.FRONTEND_URL}/signin?status=already_verified`);
		}

		user.isActive = true;
		await user.save();

		// Success → redirect to login
		return res.redirect(`${process.env.FRONTEND_URL}/signin?status=verified`);
	} catch (err) {
		return res.status(500).send("Something went wrong: " + err.message);
	}
};

const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(404).json({ message: "User not found with this email" });
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(32).toString("hex");
		const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

		// Save hashed token + expiry in DB
		user.resetPasswordToken = resetTokenHash;
		user.resetPasswordExpires = Date.now() + 1000 * 60 * 30;
		await user.save();

		// Create reset link
		const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&id=${user._id}`;

		// Send reset email
		await transporter.sendMail({
			from: `"Best★rz" <${process.env.EMAIL}>`,
			to: email,
			subject: "Password Reset Request",
			html: resetPasswordEmailTemplate(user.firstName, resetLink),
		});

		await createAuditLog(`Password reset requested`, user._id, "warning");

		return res.json({ message: "Password reset email sent successfully!" });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

// Reset Password - verify token + set new password
const resetPassword = async (req, res) => {
	try {
		const { id, token, newPassword } = req.body;


		console.log(id, token, newPassword)

		const user = await User.findById(id);
		if (!user) return res.status(404).json({ message: "User not found" });

		// Hash token and compare
		const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

		if (!user.resetPasswordToken ||
			user.resetPasswordToken !== hashedToken ||
			user.resetPasswordExpires < Date.now()) {
			return res.status(400).json({ message: "Invalid or expired token" });
		}

		// Update password
		user.passwordHash = await User.hashPassword(newPassword);
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;
		await user.save();

		await createAuditLog(`Password reset successfully`, user._id, "critical");

		return res.json({ message: "Password has been reset successfully" });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};




module.exports = {
	signup,
	signin,
	me,
	updateProfile,
	changePassword,
	verifyEmail,
	resetPassword,
	forgotPassword,

};
