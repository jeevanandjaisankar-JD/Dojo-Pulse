const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

// Small per-instance cache avoids repeating the same MongoDB lookup for every
// API request. A short TTL bounds how long account/role changes can be stale.
const USER_CACHE_TTL_MS = 20 * 1000;
const USER_CACHE_MAX_ENTRIES = 1000;
const userCache = new Map();

const getCachedUser = async (userId) => {
  const now = Date.now();
  const cached = userCache.get(userId);

  if (cached && cached.expiresAt > now) {
    return cached.user;
  }

  if (cached) userCache.delete(userId);

  const user = await User.findById(userId)
    .select('_id email name role squad isActive')
    .lean();

  if (!user || !user.isActive) {
    userCache.delete(userId);
    return null;
  }

  if (userCache.size >= USER_CACHE_MAX_ENTRIES) {
    const oldestKey = userCache.keys().next().value;
    if (oldestKey) userCache.delete(oldestKey);
  }

  userCache.set(userId, {
    user,
    expiresAt: now + USER_CACHE_TTL_MS
  });

  return user;
};

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const token = authHeader.slice(7).trim();
    const secret = process.env.JWT_SECRET;

    if (!secret || secret.length < 32) {
      return res.status(503).json({
        success: false,
        message: 'Authentication service is not configured.'
      });
    }

    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
      issuer: 'dojo-pulse',
      audience: 'dojo-pulse-mentor-portal'
    });

    if (
      typeof decoded.sub !== 'string' ||
      !mongoose.Types.ObjectId.isValid(decoded.sub)
    ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.'
      });
    }

    if (User.db.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is temporarily unavailable.'
      });
    }

    const user = await getCachedUser(decoded.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account not found or inactive.'
      });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      squad: user.squad
    };

    return next();
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError' ||
      error.name === 'CastError'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token.'
      });
    }

    console.error('[Auth Middleware] Request authentication failed.');

    return res.status(500).json({
      success: false,
      message: 'Could not authenticate request.'
    });
  }
};

module.exports = authMiddleware;
