
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Mentor = require('../models/Mentor');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be configured securely.');
  }

  return secret;
};

/**
 * Login mentor using the team MongoDB database.
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: 'Username/email and password are required.'
      });
    }

    if (Mentor.db.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Authentication service is temporarily unavailable.'
      });
    }

    const identifier = username.trim().toLowerCase();

    const mentor = await Mentor.findOne({
      $or: [
        { username: identifier },
        { email: identifier }
      ],
      isActive: true
    }).select('+passwordHash');

    if (!mentor || !(await bcrypt.compare(password, mentor.passwordHash))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username/email or password.'
      });
    }

    const secret = getJwtSecret();

    const token = jwt.sign(
      { sub: mentor.id },
      secret,
      {
        algorithm: 'HS256',
        expiresIn: '2h',
        issuer: 'dojo-pulse',
        audience: 'dojo-pulse-mentor-portal'
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      mentor: {
        id: mentor.id,
        name: mentor.name,
        username: mentor.username,
        email: mentor.email,
        role: mentor.role,
        track: mentor.track,
        avatar: mentor.avatar
      }
    });
  } catch (error) {
    console.error('[Mentor Login] Authentication request failed.');

    return res.status(500).json({
      success: false,
      message: 'Unable to complete login at this time.'
    });
  }
};

/**
 * Get current authenticated mentor profile.
 */
const getProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    mentor: req.mentor
  });
};

/**
 * List authorized mentors' public metadata.
 */
const getMentorsRoster = async (req, res) => {
  try {
    if (Mentor.db.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Mentor roster is temporarily unavailable.'
      });
    }

    const mentors = await Mentor.find({ isActive: true })
      .select('id name role track avatar')
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      mentors
    });
  } catch (error) {
    console.error('[Mentor Roster] Failed to load roster.');

    return res.status(500).json({
      success: false,
      message: 'Unable to load mentor roster.'
    });
  }
};

module.exports = {
  login,
  getProfile,
  getMentorsRoster
};
