import { verifyFirebaseToken } from '../utils/firebaseAuth.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const findOrCreateProfile = async (decoded) => {
  let user = await User.findOne({ firebaseUid: decoded.sub });
  if (!user) {
    // First time we've seen this Firebase account — provision a profile.
    // Always defaults to 'customer'; admin access is never auto-granted from
    // a token alone (see authController.claimFirstAdmin for how the very
    // first admin gets promoted, and that promotion requires no admin yet exist).
    user = await User.create({
      firebaseUid: decoded.sub,
      name: decoded.name || decoded.email?.split('@')[0] || 'User',
      email: decoded.email,
      role: 'customer',
    });
  }
  return user;
};

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  let decoded;
  try {
    decoded = await verifyFirebaseToken(token);
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, invalid or expired token');
  }

  req.user = await findOrCreateProfile(decoded);
  next();
});

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error('Not authorized to access this resource');
  }
  next();
};

// Decodes the token and populates req.user when present and valid, but never
// rejects the request when the token is missing or bad.
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (token) {
    try {
      const decoded = await verifyFirebaseToken(token);
      req.user = await findOrCreateProfile(decoded);
    } catch {
      // ignore invalid/expired token — request proceeds unauthenticated
    }
  }
  next();
});
