import express from 'express';
import { body } from 'express-validator';
import {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  duplicateProduct,
  toggleArchiveProduct,
} from '../controllers/productController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();
const requireAdmin = [protect, requireRole('admin')];

const productValidators = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
];

router.get('/', getProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', requireAdmin, getProductById);

router.post('/', requireAdmin, productValidators, validate, createProduct);
router.put('/:id', requireAdmin, updateProduct);
router.delete('/:id', requireAdmin, deleteProduct);
router.post('/:id/duplicate', requireAdmin, duplicateProduct);
router.patch('/:id/archive', requireAdmin, toggleArchiveProduct);

export default router;
