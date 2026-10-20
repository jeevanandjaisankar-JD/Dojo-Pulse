
const User = require('../models/User');

// Return the authenticated account's profile.
const getProfile = async (req, res) => {
  const user = req.user;

  return res.status(200).json({
    success: true,
    user,
    ...(user.role === 'mentor'
      ? {
          mentor: {
            ...user,
            username: user.email,
            track: '',
            avatar: ''
          }
        }
      : {})
  });
};

// List active mentor accounts.
const getMentorsRoster = async (req, res) => {
  try {
    if (User.db.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Mentor roster is temporarily unavailable.'
      });
    }

    const mentors = await User.find({
      role: 'mentor',
      isActive: true
    })
      .select('name email role')
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      mentors: mentors.map((mentor) => ({
        id: mentor._id.toString(),
        name: mentor.name,
        email: mentor.email,
        role: mentor.role,
        track: '',
        avatar: ''
      }))
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
  getProfile,
  getMentorsRoster
};
