import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', protect, requireRole('admin'), getDashboardStats);

export default router;
