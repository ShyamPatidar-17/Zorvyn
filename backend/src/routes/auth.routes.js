import express from 'express';
import { login, register } from '../controllers/auth.controller.js'
import { getAllUsers, toggleUserStatus } from '../controllers/user.controller.js';
import { protect,authorize } from '../middleware/authMiddleware.js';

const router = express.Router();


router.post('/login', login);
router.post('/register', register);
router.get('/users',protect,getAllUsers)
router.patch('/users/:id/status', protect, authorize('Admin'), toggleUserStatus);

export default router;  