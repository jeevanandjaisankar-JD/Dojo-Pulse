const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const token = authHeader.split(' ')[1];
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

    const user = await User.findById(decoded.sub);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account not found or inactive.'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      squad: user.squad
    };

    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError' ||
        error.name === 'CastError') {
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