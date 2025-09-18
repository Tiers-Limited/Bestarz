import AuditLog from '../models/AuditLog.js';

export const createAuditLog = async (action, user, status = 'normal') => {
	try {
		await AuditLog.create({
			action,
			user,
			status
		});
	} catch (error) {
		console.error('Failed to create audit log:', error);
	}
};
