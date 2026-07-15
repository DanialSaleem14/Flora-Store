import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

// req.user is already populated (and auto-provisioned as 'customer' if this
// is a brand-new Firebase account) by the `protect` middleware.
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: sanitizeUser(req.user) });
});

export const updateMe = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  await user.save();
  res.json({ success: true, user: sanitizeUser(user) });
});

// One-time bootstrap: the very first authenticated Firebase user to call
// this becomes the store's admin. Once any admin exists, this is closed —
// further admins must be promoted by an existing admin (direct DB action for
// now; no self-serve invite flow yet).
export const claimFirstAdmin = asyncHandler(async (req, res) => {
  const adminCount = await User.countDocuments({ role: 'admin' });
  if (adminCount > 0) {
    res.status(403);
    throw new Error('An admin already exists for this store. Ask them to grant you access.');
  }

  const user = await User.findById(req.user._id);
  user.role = 'admin';
  await user.save();

  res.json({ success: true, user: sanitizeUser(user) });
});
