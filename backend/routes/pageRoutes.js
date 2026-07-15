import express from 'express';
import { body } from 'express-validator';
import {
  getPages,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
} from '../controllers/pageController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();
const requireAdmin = [protect, requireRole('admin')];

router.get('/', requireAdmin, getPages);
router.get('/slug/:slug', getPageBySlug);

router.post('/', requireAdmin, [body('title').trim().notEmpty()], validate, createPage);
router.put('/:id', requireAdmin, updatePage);
router.delete('/:id', requireAdmin, deletePage);

export default router;
