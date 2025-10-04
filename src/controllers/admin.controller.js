const User = require('../models/User.js');
const Provider = require('../models/Provider.js');
const Booking = require('../models/Booking.js');
const Payment = require('../models/Payment.js');
const { createAuditLog } = require('../services/auditlog.service.js');
const PlatformSettings = require('../models/PlatformSettings.js');
const AuditLog = require('../models/AuditLog.js');


// Platform Statistics
const getPlatformStats = async (req, res) => {
    try {
        const now = new Date();

        // Current month start & end
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Previous month start & end
        const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // Run all queries in parallel
        const [
            totalRevenueAgg,
            activeProvidersAgg,
            totalBookings,
            totalClients,
            recentBookings,
            recentPayments,
            currentRevenueAgg,
            prevRevenueAgg
        ] = await Promise.all([
            // Total revenue
            Payment.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$platformFee' } } }
            ]),
            // Active providers based on User.isActive
            Provider.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: '$user' },
                { $match: { 'user.isActive': true } },
                { $count: 'activeProviders' }
            ]),
            // Total bookings
            Booking.countDocuments(),
            // Total clients
            User.countDocuments({ role: 'client' }),
            // Recent bookings
            Booking.find()
                .populate('client', 'firstName lastName email')
                .populate('provider', 'businessName user')
                .populate('provider.user', 'firstName lastName')
                .sort({ createdAt: -1 })
                .limit(5),
            // Recent payments
            Payment.find()
                .populate('client', 'firstName lastName email')
                .populate('provider', 'businessName user')
                .populate('provider.user', 'firstName lastName')
                .sort({ createdAt: -1 })
                .limit(5),
            // Current month revenue
            Payment.aggregate([
                { $match: { status: 'completed', createdAt: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth } } },
                { $group: { _id: null, total: { $sum: '$platformFee' } } }
            ]),
            // Previous month revenue
            Payment.aggregate([
                { $match: { status: 'completed', createdAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth } } },
                { $group: { _id: null, total: { $sum: '$platformFee' } } }
            ])
        ]);

        const totalRevenue = totalRevenueAgg[0]?.total || 0;
        const activeProviders = activeProvidersAgg[0]?.activeProviders || 0;
        const currentTotal = currentRevenueAgg[0]?.total || 0;
        const prevTotal = prevRevenueAgg[0]?.total || 0;

        const growthRate = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;

        return res.json({
            totalRevenue,
            activeProviders,
            totalBookings,
            totalClients,
            growthRate,
            recentBookings,
            recentPayments
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


// Get all users (clients and providers) with filtering
const getAllUsers = async (req, res) => {
    try {
        const { role, status, search, page = 1, limit = 20 } = req.query;

        const filter = {};
        if (role) filter.role = role;
        if (status) filter.isActive = status === 'active';
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await User.countDocuments(filter);

        return res.json({
            users,
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

// Get all providers with admin controls
const getAllProviders = async (req, res) => {
    try {
        const { status, category, search, page = 1, limit = 20 } = req.query;

        const userFilter = {};
        if (status) userFilter.isActive = status === "active";
        if (search) {
            userFilter.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        // Find matching users
        const users = await User.find(userFilter).select("_id firstName lastName email isActive");
        const userIds = users.map((u) => u._id);

        // Provider filter
        const providerFilter = {};
        if (category) providerFilter.serviceCategory = category;
        if (userIds.length > 0) {
            providerFilter.user = { $in: userIds };
        } else if (search || status) {
            // No users matched → return empty
            return res.json({
                providers: [],
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: 0,
                    pages: 0,
                },
            });
        }

        const skip = (Number(page) - 1) * Number(limit);

        // Fetch providers and populate user
        const providers = await Provider.find(providerFilter)
            .populate("user")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Provider.countDocuments(providerFilter);

        // Merge user + provider details
        const merged = providers.map((provider) => ({
            ...provider.toObject(),
            user: provider.user, // already populated
        }));

        return res.json({
            providers: merged,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


// Get all clients
const getAllClients = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;

        const filter = { role: 'client' };
        if (status) filter.isActive = status === 'active';
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const clients = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await User.countDocuments(filter);

        return res.json({
            clients,
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

// Update user status (block/disable/restore)
const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { action, reason } = req.body;

        if (!['block', 'disable', 'restore'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let updateData = {};
        let auditAction = '';
        let auditStatus = 'normal';

        switch (action) {
            case 'block':
                updateData = { isActive: false, status: 'blocked' };
                auditAction = `Account blocked by admin - Reason: ${reason}`;
                auditStatus = 'critical';
                break;
            case 'disable':
                updateData = { isActive: false, status: 'disabled' };
                auditAction = `Account disabled by admin - Reason: ${reason}`;
                auditStatus = 'critical';
                break;
            case 'restore':
                updateData = { isActive: true, status: 'active' };
                auditAction = `Account restored by admin - Reason: ${reason}`;
                auditStatus = 'normal';
                break;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select('-password');

        // Log the admin action
        await createAuditLog(auditAction, userId, auditStatus);

        return res.json({
            message: `User ${action}ed successfully`,
            user: updatedUser
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Get all bookings with admin view
const getAllBookings = async (req, res) => {
    try {
        const { status, provider, client, page = 1, limit = 20 } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (provider) filter.provider = provider;
        if (client) filter.client = client;

        const skip = (Number(page) - 1) * Number(limit);
        const bookings = await Booking.find(filter)
            .populate('client', 'firstName lastName email')
            .populate('provider', 'businessName user')
            .populate('provider.user', 'firstName lastName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Booking.countDocuments(filter);

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

// Get all payments with admin view
const getAllPayments = async (req, res) => {
    try {
        const { status, provider, client, page = 1, limit = 20 } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (provider) filter.provider = provider;
        if (client) filter.client = client;

        const skip = (Number(page) - 1) * Number(limit);

        const payments = await Payment.find(filter)
            .populate("client", "firstName lastName email")
            .populate("provider", "businessName user")
            .populate("provider.user", "firstName lastName")
            .populate("booking", "serviceCategory eventDate")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Payment.countDocuments(filter);

        // --- NEW: Stats aggregation ---
        const statsAgg = await Payment.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 }, totalAmount: { $sum: "$platformFee" } } }
        ]);

        const stats = statsAgg.reduce((acc, s) => {
            acc[s._id] = { count: s.count, totalAmount: s.totalAmount };
            return acc;
        }, {});

        return res.json({
            payments,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
            stats, // 👈 include stats in response
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


// Get analytics data
const getAnalytics = async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period));

        const [
            revenueData,
            bookingsByCategory,
            userGrowth,
            topProviders
        ] = await Promise.all([
            Payment.aggregate([
                { $match: { status: 'completed', createdAt: { $gte: startDate } } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                            day: { $dayOfMonth: '$createdAt' }
                        },
                        revenue: { $sum: '$amount' }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
            ]),
            Booking.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                {
                    $group: {
                        _id: '$serviceCategory',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ]),
            User.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                            day: { $dayOfMonth: '$createdAt' }
                        },
                        users: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
            ]),
            Booking.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                {
                    $group: {
                        _id: '$provider',
                        bookings: { $sum: 1 }
                    }
                },
                { $sort: { bookings: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'providers',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'provider'
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'provider.user',
                        foreignField: '_id',
                        as: 'user'
                    }
                }
            ])
        ]);

        return res.json({
            revenueData,
            bookingsByCategory,
            userGrowth,
            topProviders
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Get user details for admin view
const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let additionalData = {};

        if (user.role === 'provider') {
            const provider = await Provider.findOne({ user: userId });
            const bookings = await Booking.find({ provider: provider?._id })
                .populate('client', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .limit(10);

            additionalData = { provider, recentBookings: bookings };
        } else if (user.role === 'client') {
            const bookings = await Booking.find({ client: userId })
                .populate('provider', 'businessName user')
                .populate('provider.user', 'firstName lastName')
                .sort({ createdAt: -1 })
                .limit(10);

            additionalData = { recentBookings: bookings };
        }

        // Log admin viewing user details
        await createAuditLog(`Admin viewed user details`, userId, 'normal');

        return res.json({
            user,
            ...additionalData
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Get audit logs
const getAuditLogs = async (req, res) => {
    try {
        const { userId, status, page = 1, limit = 50 } = req.query;

        const filter = {};
        if (userId) filter.user = userId;
        if (status) filter.status = status;

        const skip = (Number(page) - 1) * Number(limit);
        const logs = await AuditLog.find(filter)
            .populate('user', 'firstName lastName email isActive status role')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await AuditLog.countDocuments(filter);

        return res.json({
            logs,
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


const getPlatformSettings = async (req, res) => {
    try {
        let settings = await PlatformSettings.findOne();

        // Create default settings if none exist
        if (!settings) {
            settings = await PlatformSettings.create({
                platformName: 'My Platform',
                supportEmail: 'support@example.com'
            });
        }

        return res.json({ settings });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Update platform settings
const updatePlatformSettings = async (req, res) => {
    try {
        const { platformName, supportEmail } = req.body;

        let settings = await PlatformSettings.findOne();

        if (!settings) {
            // Create new settings if none exist
            settings = await PlatformSettings.create({
                platformName,
                supportEmail
            });
        } else {
            // Update existing settings
            if (platformName) settings.platformName = platformName;
            if (supportEmail) settings.supportEmail = supportEmail;
            await settings.save();
        }

        // Log the admin action
        await createAuditLog(`Platform settings updated - Name: ${platformName || 'unchanged'}, Email: ${supportEmail || 'unchanged'}`, req.user.id, 'normal');

        return res.json({
            message: 'Platform settings updated successfully',
            settings
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};



module.exports = {
    getPlatformStats,
    getAllUsers,
    getAllProviders,
    getAllClients,
    updateUserStatus,
    getAllBookings,
    getAllPayments,
    getAnalytics,
    getUserDetails,
    getAuditLogs,
    getPlatformSettings,
    updatePlatformSettings
};
