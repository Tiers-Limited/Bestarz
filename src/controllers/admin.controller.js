import User from '../models/User.js';
import Provider from '../models/Provider.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';

export const getPlatformStats = async (req, res) => {
    try {
        const [
            totalRevenue,
            activeProviders,
            totalBookings,
            totalClients,
            recentBookings,
            recentPayments
        ] = await Promise.all([
            Payment.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Provider.countDocuments({ isActive: true }),
            Booking.countDocuments(),
            User.countDocuments({ role: 'client' }),
            Booking.find()
                .populate('client', 'firstName lastName email')
                .populate('provider', 'businessName user')
                .populate('provider.user', 'firstName lastName')
                .sort({ createdAt: -1 })
                .limit(5),
            Payment.find()
                .populate('client', 'firstName lastName email')
                .populate('provider', 'businessName user')
                .populate('provider.user', 'firstName lastName')
                .sort({ createdAt: -1 })
                .limit(5)
        ]);

        const revenue = totalRevenue[0]?.total || 0;
        const growthRate = 23.5; // This would be calculated based on previous periods

        return res.json({
            totalRevenue: revenue,
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

export const getAllUsers = async (req, res) => {
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

// Update user status (block/disable/restore)
export const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { action, reason } = req.body; // action: 'block', 'disable', 'restore'

        if (!['block', 'disable', 'restore'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let updateData = {};
        switch (action) {
            case 'block':
                updateData = { isActive: false, status: 'blocked' };
                break;
            case 'disable':
                updateData = { isActive: false, status: 'disabled' };
                break;
            case 'restore':
                updateData = { isActive: true, status: 'active' };
                break;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select('-password');

        // Log the action (you might want to create an audit log model)
        console.log(`Admin ${req.user.id} ${action}ed user ${userId}. Reason: ${reason}`);

        return res.json({
            message: `User ${action}ed successfully`,
            user: updatedUser
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Get user details for admin view
export const getUserDetails = async (req, res) => {
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

        return res.json({
            user,
            ...additionalData
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
