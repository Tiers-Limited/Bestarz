const jwt = require('jsonwebtoken');

 const auth = (roles = []) => {
	const allowedRoles = Array.isArray(roles) ? roles : [roles];
	return (req, res, next) => {
		const header = req.headers.authorization || req.headers.Authorization || '';
		const token = header && header.startsWith && header.startsWith('Bearer ') ? header.slice(7) : null;
		if (!token) {
			console.info('Auth middleware: no token provided for', req.method, req.originalUrl);
			return res.status(401).json({ message: 'Unauthorized' });
		}
		try {
			const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
			// Minimal log: id and role only (avoid logging token contents)
			console.info('Auth middleware: token decoded for user', { id: payload.id, role: payload.role, url: req.originalUrl });
			req.user = payload; // { id, role }

			if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
				console.info('Auth middleware: forbidden role', payload.role, 'required', allowedRoles);
				return res.status(403).json({ message: 'Forbidden' });
			}
			return next();
		} catch (err) {
			console.info('Auth middleware: invalid token for request', req.method, req.originalUrl, 'error:', err.message);
			return res.status(401).json({ message: 'Invalid token' });
		}
	};
};


module.exports = { auth };





