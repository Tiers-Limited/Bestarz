const Provider = require('../models/Provider.js');
const User = require('../models/User.js');
const Booking = require('../models/Booking.js');
const Payment = require('../models/Payment.js');

// Get provider dashboard stats
const getProviderDashboard = async (req, res) => {
	try {
		const userId = req.user.id;
		
		// Try to find existing provider profile
		let provider = await Provider.findOne({ user: userId });
		
		// If no provider profile exists, create a basic one
		if (!provider) {
			const user = await User.findById(userId);
			if (!user) {
				return res.status(404).json({ message: 'User not found' });
			}
			
			// Generate a basic slug from user's name
			const baseName = `${user.firstName}-${user.lastName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
			let slug = baseName;
			let counter = 1;
			while (await Provider.findOne({ slug })) {
				slug = `${baseName}-${counter}`;
				counter++;
			}
			
			provider = await Provider.create({
				user: userId,
				businessName: `${user.firstName} ${user.lastName}`,
				slug: slug,
				category: 'General Services', // Default category
				description: '',
				services: [],
				basePrice: 0,
				location: '',
				rating: 0,
				reviews: [],
				portfolio: [],
				rateCards: [],
				availability: {},
				website: ''
			});
		}

		// Get current date ranges
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

		// Booking stats
		const totalBookings = await Booking.countDocuments({ provider: provider._id });
		const pendingBookings = await Booking.countDocuments({
			provider: provider._id,
			status: 'pending'
		});
		const confirmedBookings = await Booking.countDocuments({
			provider: provider._id,
			status: 'confirmed'
		});
		const thisMonthBookings = await Booking.countDocuments({
			provider: provider._id,
			createdAt: { $gte: startOfMonth }
		});

		// Revenue stats
		const completedPayments = await Payment.find({
			provider: provider._id,
			status: 'completed'
		});
		const totalRevenue = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
		const thisMonthRevenue = completedPayments
			.filter(payment => payment.processedAt >= startOfMonth)
			.reduce((sum, payment) => sum + payment.amount, 0);

		// Recent bookings
		const recentBookings = await Booking.find({ provider: provider._id })
			.populate('client', 'firstName lastName email phone')
			.sort({ createdAt: -1 })
			.limit(5);

		// Recent inquiries (pending bookings)
		const recentInquiries = await Booking.find({
			provider: provider._id,
			status: 'pending'
		})
			.populate('client', 'firstName lastName email phone')
			.sort({ createdAt: -1 })
			.limit(5);

		return res.json({
			provider: {
				_id: provider._id,
				id: provider._id,  // Fallback for compatibility
				slug: provider.slug,
				businessName: provider.businessName,
				category: provider.category,
				rating: provider.rating,
				reviews: provider.reviews
			},
			stats: {
				totalBookings,
				pendingBookings,
				confirmedBookings,
				thisMonthBookings,
				totalRevenue,
				thisMonthRevenue,
				averageRating: provider.rating || 0,
				totalReviews: provider.reviews || 0
			},
			recentBookings,
			recentInquiries
		});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

// Get provider profile
const getMyProviderProfile = async (req, res) => {
	try {
		const userId = req.user.id;
		
		// Try to find existing provider profile
		let provider = await Provider.findOne({ user: userId }).populate('user');
		
		// If no provider profile exists, create a basic one
		if (!provider) {
			console.log("getMyProviderProfile: Creating basic provider profile for user", userId);
			const user = await User.findById(userId);
			if (!user) {
				return res.status(404).json({ message: 'User not found' });
			}
			
			// Generate a basic slug from user's name
			const baseName = `${user.firstName}-${user.lastName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
			let slug = baseName;
			let counter = 1;
			while (await Provider.findOne({ slug })) {
				slug = `${baseName}-${counter}`;
				counter++;
			}
			
			provider = await Provider.create({
				user: userId,
				businessName: `${user.firstName} ${user.lastName}`,
				slug: slug,
				category: 'General Services', // Default category
				description: '',
				services: [],
				basePrice: 0,
				location: '',
				rating: 0,
				reviews: [],
				portfolio: [],
				rateCards: [],
				availability: {},
				website: ''
			});
			console.log("getMyProviderProfile: Created provider profile", provider._id);
			
			// Populate the user again
			provider = await Provider.findById(provider._id).populate('user');
		}
		
		return res.json({ provider });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

// Update provider profile
const updateProviderProfile = async (req, res) => {
	try {
	  const userId = req.user.id;
	  const update = req.body;
  
	  // Generate slug if needed
	  if (update.businessName && !update.slug) {
		update.slug = update.businessName
		  .toLowerCase()
		  .replace(/[^a-z0-9]+/g, '-')
		  .replace(/^-+|-+$/g, '');
	  }
  
	  // Extract profileImage & phone if present
	  const { profileImage, phone, ...providerUpdate } = update;
  
	  // Update Provider
	  const provider = await Provider.findOneAndUpdate(
		{ user: userId },
		{ $set: providerUpdate },
		{ new: true, upsert: true }
	  ).populate('user', 'firstName lastName profileImage email phone');
  
	  // Update User profileImage and/or phone if provided
	  const userUpdate = {};
	  if (profileImage) userUpdate.profileImage = profileImage;
	  if (phone) userUpdate.phone = phone;
  
	  if (Object.keys(userUpdate).length > 0) {
		await User.findByIdAndUpdate(userId, { $set: userUpdate }, { new: true });
	  }
  
	  return res.json({ provider });
	} catch (err) {
	  return res.status(500).json({ message: err.message });
	}
  };
  

// Get provider bookings with filtering
const getProviderBookings = async (req, res) => {
	try {
		const userId = req.user.id;
		const { status, page = 1, limit = 20, startDate, endDate } = req.query;

		console.log('📋 getProviderBookings - userId:', userId, 'filters:', { status, page, limit, startDate, endDate });

		const provider = await Provider.findOne({ user: userId });
		console.log('👤 Provider lookup result:', provider ? { 
			id: provider._id, 
			userId: provider.user,
			businessName: provider.businessName,
			specialties: provider.specialties 
		} : 'Not found');
		
		if (!provider) {
			console.log('❌ No provider found for user ID:', userId);
			console.log('🔍 Available providers in DB:');
			const allProviders = await Provider.find({}).select('user businessName').limit(5);
			console.log(allProviders.map(p => ({ id: p._id, userId: p.user, businessName: p.businessName })));
			return res.status(404).json({ message: 'Provider profile not found' });
		}

		let filter = { provider: provider._id };
		if (status) filter.status = status;
		if (startDate || endDate) {
			filter.dateStart = {};
			if (startDate) filter.dateStart.$gte = new Date(startDate);
			if (endDate) filter.dateStart.$lte = new Date(endDate);
		}

		console.log('🔍 Booking filter:', filter);
		
		// Additional debugging: Check if there are any bookings for ANY provider from this user
		const allBookingsForUser = await Booking.find({ 
			$or: [
				{ client: userId },  // Bookings where user is the client
				{ provider: provider._id }  // Bookings for this provider
			]
		}).select('_id provider client status eventType dateStart').limit(5);
		
		console.log('🔍 All related bookings for debugging:', allBookingsForUser.map(b => ({
			id: b._id,
			providerId: b.provider,
			clientId: b.client,
			status: b.status,
			eventType: b.eventType
		})));

		const bookings = await Booking.find(filter)
			.populate('client', 'firstName lastName email phone profileImage')
			.sort({ dateStart: 1 })
			.skip((Number(page) - 1) * Number(limit))
			.limit(Number(limit));

		const total = await Booking.countDocuments(filter);
		
		console.log('📊 Booking results:', { 
			bookingsFound: bookings.length, 
			totalCount: total,
			firstBooking: bookings[0] ? {
				id: bookings[0]._id,
				status: bookings[0].status,
				client: bookings[0].client ? bookings[0].client.firstName : 'No client',
				isAnonymous: bookings[0].isAnonymous,
				eventType: bookings[0].eventType,
				dateStart: bookings[0].dateStart
			} : 'None',
			allBookingIds: bookings.map(b => ({ id: b._id, status: b.status, hasClient: !!b.client }))
		});

		return res.json({
			bookings,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total,
				pages: Math.ceil(total / Number(limit))
			}
		});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

// Update booking status
const updateBookingStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status, notes, amount } = req.body;
		const userId = req.user.id;

		const provider = await Provider.findOne({ user: userId });
		if (!provider) return res.status(404).json({ message: 'Provider profile not found' });

		const booking = await Booking.findOne({ _id: id, provider: provider._id });
		if (!booking) return res.status(404).json({ message: 'Booking not found' });

		booking.status = status;
		if (notes) booking.notes = notes;
		if (amount) booking.amount = amount;
		booking.updatedAt = new Date();

		await booking.save();

		await booking.populate('client', 'firstName lastName email phone profileImage');

		return res.json({ booking });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

// Get provider customers
const getProviderCustomers = async (req, res) => {
	try {
		const userId = req.user.id;
		const { page = 1, limit = 20, search } = req.query;

		const provider = await Provider.findOne({ user: userId });
		if (!provider) return res.status(404).json({ message: 'Provider profile not found' });

		// Get unique customers who have bookings with this provider
		const bookings = await Booking.find({ provider: provider._id })
			.populate('client', 'firstName lastName email phone profileImage')
			.sort({ createdAt: -1 });

		// Group bookings by customer
		const customerMap = new Map();
		bookings.forEach(booking => {
			const customerId = booking.client._id.toString();
			if (!customerMap.has(customerId)) {
				customerMap.set(customerId, {
					...booking.client.toObject(),
					totalBookings: 0,
					totalSpent: 0,
					lastBooking: null,
					bookingHistory: [],
					status: 'active'
				});
			}

			const customer = customerMap.get(customerId);
			customer.totalBookings += 1;
			if (booking.amount) customer.totalSpent += booking.amount;
			if (!customer.lastBooking || booking.dateStart > customer.lastBooking) {
				customer.lastBooking = booking.dateStart;
			}
			customer.bookingHistory.push(booking);
		});

		let customers = Array.from(customerMap.values());

		// Apply search filter
		if (search) {
			const searchRegex = new RegExp(search, 'i');
			customers = customers.filter(customer =>
				searchRegex.test(customer.firstName) ||
				searchRegex.test(customer.lastName) ||
				searchRegex.test(customer.email)
			);
		}

		// Pagination
		const total = customers.length;
		const startIndex = (Number(page) - 1) * Number(limit);
		const paginatedCustomers = customers.slice(startIndex, startIndex + Number(limit));

		return res.json({
			customers: paginatedCustomers,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total,
				pages: Math.ceil(total / Number(limit))
			}
		});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

// Get provider earnings
const getProviderEarnings = async (req, res) => {
	try {
		const userId = req.user.id;
		const { page = 1, limit = 20, status } = req.query;
		
		console.log('💰 Getting provider earnings for user:', userId);

		const provider = await Provider.findOne({ user: userId });
		if (!provider) {
			console.log('❌ Provider profile not found for user:', userId);
			return res.status(404).json({ message: 'Provider profile not found' });
		}
		
		console.log('✅ Provider found:', provider._id);

		// Let's check if ANY payments exist in the database
		const allPaymentsCount = await Payment.countDocuments({});
		console.log('📊 Total payments in database:', allPaymentsCount);

		// Check total bookings in database
		const totalBookingsCount = await Booking.countDocuments({});
		console.log('📊 Total bookings in database:', totalBookingsCount);

		// Check if this provider has ANY bookings
		const allBookings = await Booking.find({ provider: provider._id });
		console.log('📅 Provider bookings count:', allBookings.length);
		if (allBookings.length > 0) {
			console.log('📋 Booking statuses:', allBookings.map(b => ({ id: b._id, status: b.status, paymentStatus: b.paymentStatus })));
		}

		let filter = { provider: provider._id };
		if (status) filter.status = status;
		
		console.log('🔍 Payment filter:', filter);

		const payments = await Payment.find(filter)
			.select('amount platformFee providerEarnings status createdAt processedAt stripePaymentIntentId paymentMethod currency paymentType totalAmount')
			.populate([
				{ path: 'booking', select: 'serviceCategory eventType dateStart location' },
				{ path: 'client', select: '-passwordHash -refreshToken -__v' }
			])
			.sort({ createdAt: -1 })
			.skip((Number(page) - 1) * Number(limit))
			.limit(Number(limit));
			
		console.log('📊 Found payments:', payments.length);

		const total = await Payment.countDocuments(filter);
		console.log('📈 Total payment count:', total);

		// Calculate stats
		const allPayments = await Payment.find({ provider: provider._id, status: 'completed' });
		console.log('💳 All completed payments:', allPayments.length);
		const totalEarnings = allPayments.reduce((sum, payment) => sum + payment.providerEarnings, 0);

		const thisMonth = new Date();
		thisMonth.setDate(1);
		thisMonth.setHours(0, 0, 0, 0);

		const thisMonthEarnings = allPayments
			.filter(payment => payment.processedAt && payment.processedAt >= thisMonth)
			.reduce((sum, payment) => sum + payment.providerEarnings, 0);

		const pendingPayments = await Payment.find({ provider: provider._id, status: 'pending' });
		console.log('⏳ Pending payments:', pendingPayments.length);
		const upcomingPayout = pendingPayments.reduce((sum, payment) => sum + payment.providerEarnings, 0);

		console.log('✅ Returning earnings data:', {
			paymentsCount: payments.length,
			totalEarnings,
			thisMonthEarnings,
			upcomingPayout
		});

		return res.json({
			payments,
			stats: {
				totalEarnings,
				thisMonthEarnings,
				upcomingPayout
			},
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total,
				pages: Math.ceil(total / Number(limit))
			}
		});
	} catch (err) {
		console.error('❌ Provider earnings error:', err);
		return res.status(500).json({ message: err.message });
	}
};


// Rate card management
const getProviderRateCards = async (req, res) => {
	try {
		const userId = req.user.id;
		const provider = await Provider.findOne({ user: userId });
		if (!provider) return res.status(404).json({ message: 'Provider profile not found' });

		return res.json({ rateCards: provider.rateCards || [] });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

const createRateCard = async (req, res) => {
	try {
		const userId = req.user.id;
		const { service, basePrice, duration, includes } = req.body;

		const provider = await Provider.findOne({ user: userId });
		if (!provider) return res.status(404).json({ message: 'Provider profile not found' });

		const rateCard = {
			id: Date.now().toString(),
			service,
			basePrice,
			duration,
			includes: includes || []
		};

		if (!provider.rateCards) provider.rateCards = [];
		provider.rateCards.push(rateCard);

		await provider.save();

		return res.status(201).json({ rateCard });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

const updateRateCard = async (req, res) => {
	try {
		const userId = req.user.id;
		const { id } = req.params;
		const update = req.body;

		const provider = await Provider.findOne({ user: userId });
		if (!provider) {
			return res.status(404).json({ message: 'Provider profile not found' });
		}

		const rateCardIndex = provider.rateCards?.findIndex(rc => rc.id === id);
		if (rateCardIndex === -1) {
			return res.status(404).json({ message: 'Rate card not found' });
		}

		Object.assign(provider.rateCards[rateCardIndex], update);

		await provider.save();

		return res.json({ rateCard: provider.rateCards[rateCardIndex] });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

const deleteRateCard = async (req, res) => {
	try {
		const userId = req.user.id;
		const { id } = req.params;

		const provider = await Provider.findOne({ user: userId });
		if (!provider) return res.status(404).json({ message: 'Provider profile not found' });

		if (!provider.rateCards) return res.status(404).json({ message: 'Rate card not found' });

		provider.rateCards = provider.rateCards.filter(rc => rc.id !== id);
		await provider.save();

		return res.json({ message: 'Rate card deleted successfully' });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

// Provider settings
const getProviderSettings = async (req, res) => {
	try {
		const userId = req.user.id;
		const provider = await Provider.findOne({ user: userId })
			.populate('user', 'firstName lastName email phone');

		if (!provider) return res.status(404).json({ message: 'Provider profile not found' });

		return res.json({
			settings: {
				businessName: provider.businessName,
				email: provider.user.email,
				phone: provider.user.phone,


			}
		});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

const updateProviderSettings = async (req, res) => {
	try {
		const userId = req.user.id;
		const { businessName, phone } = req.body;

		const provider = await Provider.findOne({ user: userId });
		if (!provider) return res.status(404).json({ message: 'Provider profile not found' });

		// Update provider settings
		if (businessName) provider.businessName = businessName;


		provider.settings = {
			...provider.settings
		};

		await provider.save();

		// Update user phone if provided
		if (phone) {
			await User.findByIdAndUpdate(userId, { phone });
		}

		return res.json({ message: 'Settings updated successfully' });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};




const getProviderById = async (req, res) => {
	try {
		const { id } = req.params;
		const mongoose = require('mongoose');

		// Validate that the id is a valid ObjectId
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: 'Invalid provider ID format' });
		}
		
		// Find provider by ObjectId only
		const provider = await Provider.findById(id)
			.populate('user', 'firstName lastName profileImage email phone')
			.select('-user.passwordHash ');

		if (!provider) {
			return res.status(404).json({ message: 'Provider not found' });
		}

		// Return public profile data
		return res.json({
			provider: {
				id: provider._id,
				slug: provider.slug,
				businessName: provider.businessName,
				category: provider.category,
				description: provider.description,
				services: provider.services,
				basePrice: provider.basePrice,
				location: provider.location,
				rating: provider.rating,
				reviews: provider.reviews,
				portfolio: provider.portfolio,
				rateCards: provider.rateCards,
				availability: provider.availability,
				website:provider.website,

				user: {
					firstName: provider.user.firstName,
					lastName: provider.user.lastName,
					profileImage: provider.user.profileImage,
					phone: provider.user.phone,
					email: provider.user.email
				}
			}
		});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};


module.exports = {
	getProviderDashboard,
	getMyProviderProfile,
	updateProviderProfile,
	getProviderBookings,
	updateBookingStatus,
	getProviderCustomers,
	getProviderEarnings,
	getProviderRateCards,
	createRateCard,
	updateRateCard,
	deleteRateCard,
	getProviderSettings,
	updateProviderSettings,
	getProviderById
};