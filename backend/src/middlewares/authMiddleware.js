
const jwt = require('jsonwebtoken');
const Mentor = require('../models/Mentor');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Mentor authentication required.'
    });
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Mentor authentication required.'
    });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    console.error('[Auth] JWT_SECRET is missing or too short.');

    return res.status(503).json({
      success: false,
      message: 'Authentication service is temporarily unavailable.'
    });
  }

  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
      issuer: 'dojo-pulse',
      audience: 'dojo-pulse-mentor-portal'
    });

    if (typeof decoded.sub !== 'string' || !decoded.sub) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. Please log in again.'
      });
    }

    if (Mentor.db.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Authentication service is temporarily unavailable.'
      });
    }

    const mentor = await Mentor.findOne({
      id: decoded.sub,
      isActive: true
    })
      .select('id name username email role track avatar')
      .lean();

    if (!mentor) {
      return res.status(401).json({
        success: false,
        message: 'Mentor account is inactive or not recognized.'
      });
    }

    req.mentor = mentor;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError' ||
        error.name === 'NotBeforeError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.'
      });
    }

    console.error('[Auth] Authentication request failed.');

    return res.status(500).json({
      success: false,
      message: 'Unable to authenticate this request.'
    });
  }
};

module.exports = authMiddleware;
