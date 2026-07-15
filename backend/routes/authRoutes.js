import express from 'express';
import { getMe, updateMe, claimFirstAdmin } from '../controllers/authController.js';
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  toggleWishlist,
} from '../controllers/customerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require a valid Firebase ID token — signup/login/password reset
// happen client-side via the Firebase Auth SDK and never touch this API.
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.post('/claim-first-admin', protect, claimFirstAdmin);

router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:productId', protect, toggleWishlist);

export default router;
