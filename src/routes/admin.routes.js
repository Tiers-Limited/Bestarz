import { Router } from 'express';
import {
    getAllUsers,
    getPlatformStats,
    getUserDetails,
    updateUserStatus

} from '../controllers/admin.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// All admin routes require admin role
router.use(auth('admin'));

// Platform statistics
router.get('/stats', getPlatformStats);


// User management
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserDetails);
router.patch('/users/:userId/status', updateUserStatus);





export default router;
