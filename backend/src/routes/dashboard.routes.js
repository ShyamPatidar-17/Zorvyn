
import express from 'express';
import { getDashboardSummary } from '../controllers/dashboard.controller.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get( '/summary',  protect,  authorize('Viewer', 'Analyst', 'Admin'),  getDashboardSummary);

export default router;