const User = require('../models/User.js');
const Booking = require('../models/Booking.js');
const Payment = require('../models/Payment.js');
const Provider = require('../models/Provider.js');


// Get client dashboard stats
 const getClientDashboard = async (req, res) => {
	try {
		const userId = req.user.id;
		
		// Get current date ranges
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
		
		// Booking stats
		const totalBookings = await Booking.countDocuments({ client: userId });
		const upcomingBookings = await Booking.countDocuments({ 
			client: userId, 
			status: 'confirmed',
			dateStart: { $gte: now }
		});
		const completedBookings = await Booking.countDocuments({ 
			client: userId, 
			status: 'completed' 
		});
		const pendingBookings = await Booking.countDocuments({ 
			client: userId, 
			status: 'pending' 
		});
		const thisMonthBookings = await Booking.countDocuments({
			client: userId,
			createdAt: { $gte: startOfMonth }
		});
		
		// Payment stats
		const completedPayments = await Payment.find({ 
			client: userId, 
			status: 'completed' 
		});
		const totalSpent = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
		const thisMonthSpent = completedPayments
			.filter(payment => payment.processedAt >= startOfMonth)
			.reduce((sum, payment) => sum + payment.amount, 0);
		
		const pendingPayments = await Payment.countDocuments({ 
			client: userId, 
			status: 'pending' 
		});
		
		// Recent bookings
		const recentBookings = await Booking.find({ client: userId })
			.populate('provider', 'businessName user')
			.populate({
				path: 'provider',
				populate: {
					path: 'user',
					select: 'firstName lastName profileImage'
				}
			})
			.sort({ createdAt: -1 })
			.limit(5);
		
		// Upcoming events
		const upcomingEvents = await Booking.find({ 
			client: userId,
			status: 'confirmed',
			dateStart: { $gte: now }
		})
			.populate('provider', 'businessName user')
			.populate({
				path: 'provider',
				populate: {
					path: 'user',
					select: 'firstName lastName profileImage'
				}
			})
			.sort({ dateStart: 1 })
			.limit(3);
		
		return res.json({
			stats: {
				totalBookings,
				upcomingBookings,
				completedBookings,
				pendingBookings,
				thisMonthBookings,
				totalSpent,
				thisMonthSpent,
				pendingPayments
			},
			recentBookings,
			upcomingEvents
		});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};
// Get client profile
 const getClientProfile = async (req, res) => {
	try {
		const userId = req.user.id;
		const user = await User.findById(userId).select('-passwordHash -refreshToken');
		if (!user) return res.status(404).json({ message: 'User not found' });
		return res.json({ user });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};
// Update client profile
 const updateClientProfile = async (req, res) => {
	try {
		const userId = req.user.id;
		const update = req.body;
		
		// Remove sensitive fields that shouldn't be updated this way
		delete update.passwordHash;
		delete update.refreshToken;
		delete update.role;
		
		const user = await User.findByIdAndUpdate(
			userId,
			{ $set: update },
			{ new: true }
		).select('-passwordHash -refreshToken');
		
		return res.json({ user });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

// Search providers
 const searchProviders = async (req, res) => {
    try {
        const { 
            q, 
            category, 
            location, 
            minPrice, 
            maxPrice, 
            rating,
            page = 1, 
            limit = 12,
            sortBy = 'rating' 
        } = req.query;
        
        // Remove isActive from provider; filter via populate.match
        let filter = {};
        
        // Text search
        if (q) {
            filter.$or = [
                { businessName: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { services: { $elemMatch: { $regex: q, $options: 'i' } } }
            ];
        }
        
        // Category filter
        if (category) filter.category = category;
        
        // Location filter
        if (location) {
            filter['location.city'] = { $regex: location, $options: 'i' };
        }
        
        // Price range filter
        if (minPrice || maxPrice) {
            filter.basePrice = {};
            if (minPrice) filter.basePrice.$gte = Number(minPrice);
            if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
        }
        
        // Rating filter
        if (rating) filter.rating = { $gte: Number(rating) };
        
        // Sort options
        let sortOptions = {};
        switch (sortBy) {
            case 'price_low':
                sortOptions = { basePrice: 1 };
                break;
            case 'price_high':
                sortOptions = { basePrice: -1 };
                break;
            case 'rating':
                sortOptions = { rating: -1, reviews: -1 };
                break;
            case 'newest':
                sortOptions = { createdAt: -1 };
                break;
            default:
                sortOptions = { rating: -1 };
        }

        // Populate user and filter by user.isActive
        const providers = await Provider.find(filter)
            .populate({
                path: 'user',
                select: 'firstName lastName profileImage isActive',
                match: { isActive: true } // Only active users
            })
            .select('businessName category description basePrice location rating reviews portfolio slug')
            .sort(sortOptions)
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        // Remove providers with inactive users
        const activeProviders = providers.filter(p => p.user);

        const total = activeProviders.length;

        return res.json({
            providers: activeProviders,
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



module.exports = {
    getClientDashboard,
    getClientProfile,
    updateClientProfile,
    searchProviders
};
