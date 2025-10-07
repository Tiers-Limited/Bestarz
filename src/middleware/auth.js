const jwt = require('jsonwebtoken');

 const auth = (roles = []) => {
	const allowedRoles = Array.isArray(roles) ? roles : [roles];
	return (req, res, next) => {
		const header = req.headers.authorization || '';
		const token = header.startsWith('Bearer ') ? header.slice(7) : null;
		if (!token) return res.status(401).json({ message: 'Unauthorized' });
		try {
			const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
			req.user = payload; // { id, role }

			if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
				return res.status(403).json({ message: 'Forbidden' });
			}
			return next();
		} catch (err) {
			return res.status(401).json({ message: 'Invalid token' });
		}
	};
};


module.exports = { auth };





