const jwt = require('jsonwebtoken');
const { MENTORS } = require('../config/mentors');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Mentor authentication required.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'dojo_pulse_super_secret_mentor_jwt_key_2026'
    );

    const mentor = MENTORS.find((m) => m.id === decoded.id || m.username === decoded.username);
    if (!mentor) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Mentor profile not recognized.'
      });
    }

    req.mentor = {
      id: mentor.id,
      name: mentor.name,
      username: mentor.username,
      email: mentor.email,
      role: mentor.role,
      track: mentor.track,
      avatar: mentor.avatar
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired mentor session token. Please log in again.'
    });
  }
};

module.exports = authMiddleware;
