const jwt = require('jsonwebtoken');
const { MENTORS } = require('../config/mentors');

/**
 * Login mentor
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.'
      });
    }

    const mentor = MENTORS.find(
      (m) =>
        (m.username.toLowerCase() === username.trim().toLowerCase() ||
         m.email.toLowerCase() === username.trim().toLowerCase()) &&
        m.password === password
    );

    if (!mentor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Only authorized Kalvium Dojo mentor can access this portal.'
      });
    }

    const token = jwt.sign(
      {
        id: mentor.id,
        username: mentor.username,
        name: mentor.name,
        role: mentor.role
      },
      process.env.JWT_SECRET || 'dojo_pulse_super_secret_mentor_jwt_key_2026',
      { expiresIn: '7d' }
    );

    const safeMentor = {
      id: mentor.id,
      name: mentor.name,
      username: mentor.username,
      email: mentor.email,
      role: mentor.role,
      track: mentor.track,
      avatar: mentor.avatar
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      mentor: safeMentor
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Login error: ${error.message}`
    });
  }
};

/**
 * Get current authenticated mentor profile
 */
const getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      mentor: req.mentor
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * List authorized mentors (public metadata)
 */
const getMentorsRoster = async (req, res) => {
  const roster = MENTORS.map(({ password, ...mentor }) => mentor);
  return res.status(200).json({
    success: true,
    mentors: roster
  });
};

module.exports = {
  login,
  getProfile,
  getMentorsRoster
};
