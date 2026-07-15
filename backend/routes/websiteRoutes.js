import express from 'express';
import { getWebsite, updateWebsite } from '../controllers/websiteController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getWebsite);
router.put('/', protect, requireRole('admin'), updateWebsite);

export default router;
