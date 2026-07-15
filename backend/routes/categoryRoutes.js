import express from 'express';
import { body } from 'express-validator';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();
const requireAdmin = [protect, requireRole('admin')];

router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

router.post(
  '/',
  requireAdmin,
  [body('name').trim().notEmpty().withMessage('Category name is required')],
  validate,
  createCategory
);
router.put('/:id', requireAdmin, updateCategory);
router.delete('/:id', requireAdmin, deleteCategory);

export default router;
