
const User = require('../models/User');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-googleId');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found.'
      });
    }

    return res.json({
      success: true,
      profile: user
    });
  } catch (error) {
    console.error('[Profile] Failed to fetch profile:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile.'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'name',
      'surname',
      'personalEmail',
      'professionalRole',
      'linkedin',
      'bio',
      'educationalQualifications',
      'yearOfJoining',
      'dateOfBirth',
      'contactNumber',
      'highestQualification',
      'degreeSpecialization',
      'institution',
      'yearOfCompletion',
      'areaOfExpertise',
      'technicalSkills',
      'yearsOfExperience'
    ];

const user = await User.findById(req.user.id);

if (!user) {
  return res.status(404).json({
    success: false,
    message: 'Profile not found.'
  });
}

const requiredFields = [
  'name',
  'surname',
  'personalEmail',
  'professionalRole',
  'educationalQualifications'
];

for (const field of requiredFields) {
  const value = Object.prototype.hasOwnProperty.call(req.body, field)
    ? req.body[field]
    : user[field];

if (typeof value !== 'string' || !value.trim()) {
  return res.status(400).json({
    success: false,
    message: `${field} is required.`
    });
  }
}

if (!user.email || !user.email.trim()) {
  return res.status(400).json({
    success: false,
    message: 'Kalvium Email is required.'
  });
}

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        user[field] = req.body[field];
      }
    }

    await user.save();

    const updatedProfile = await User.findById(user._id)
      .select('-googleId');

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('[Profile] Failed to update profile:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update profile.'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile
};
