const User = require('../models/User');

const PROFILE_FIELDS = [
  'name',
  'dateOfBirth',
  'contactNumber',
  'qualification',
  'degree',
  'institution',
  'completionYear',
  'designation',
  'expertise',
  'technicalSkills',
  'yearsOfExperience'
];

const serializeMentor = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  squad: user.squad,
  dateOfBirth: user.dateOfBirth
    ? new Date(user.dateOfBirth).toISOString().slice(0, 10)
    : '',
  contactNumber: user.contactNumber || '',
  qualification: user.qualification || '',
  degree: user.degree || '',
  institution: user.institution || '',
  completionYear: user.completionYear ?? '',
  designation: user.designation || '',
  expertise: user.expertise || '',
  technicalSkills: user.technicalSkills || '',
  yearsOfExperience: user.yearsOfExperience ?? ''
});

// Return the authenticated account's profile.
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found.'
      });
    }

    const profile = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      squad: user.squad
    };

    return res.status(200).json({
      success: true,
      user: profile,
      ...(user.role === 'mentor'
        ? { mentor: serializeMentor(user) }
        : {})
    });
  } catch (error) {
    console.error('[Profile] Failed to load profile.');
    return res.status(500).json({
      success: false,
      message: 'Unable to load profile.'
    });
  }
};

// Update only the authenticated mentor's editable profile fields.
const updateMentorProfile = async (req, res) => {
  try {
    if (req.user.role !== 'mentor') {
      return res.status(403).json({
        success: false,
        message: 'Only mentors can update mentor profiles.'
      });
    }

    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const updates = {};

    for (const field of PROFILE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        updates[field] = body[field];
      }
    }

    const cleanString = (value, label, maxLength = 120) => {
      if (typeof value !== 'string') {
        throw new Error(`${label} must be text.`);
      }
      const cleaned = value.trim();
      if (cleaned.length > maxLength) {
        throw new Error(`${label} must be ${maxLength} characters or fewer.`);
      }
      return cleaned;
    };

    if (Object.prototype.hasOwnProperty.call(updates, 'name')) {
      updates.name = cleanString(updates.name, 'Full name');
      if (!updates.name) throw new Error('Full name is required.');
    }

    for (const field of [
      'contactNumber', 'qualification', 'degree', 'institution',
      'designation', 'expertise', 'technicalSkills'
    ]) {
      if (Object.prototype.hasOwnProperty.call(updates, field)) {
        updates[field] = cleanString(
          updates[field],
          field,
          field === 'technicalSkills' ? 500 : 160
        );
      }
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'dateOfBirth')) {
      if (updates.dateOfBirth === '' || updates.dateOfBirth === null) {
        updates.dateOfBirth = null;
      } else {
        const date = new Date(updates.dateOfBirth);
        if (
          typeof updates.dateOfBirth !== 'string' ||
          Number.isNaN(date.getTime()) ||
          date.toISOString().slice(0, 10) !== updates.dateOfBirth ||
          date > new Date()
        ) {
          throw new Error('Enter a valid date of birth.');
        }
        updates.dateOfBirth = date;
      }
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'completionYear')) {
      if (updates.completionYear === '' || updates.completionYear === null) {
        updates.completionYear = null;
      } else {
        const year = Number(updates.completionYear);
        const currentYear = new Date().getFullYear();
        if (!Number.isInteger(year) || year < 1950 || year > currentYear + 10) {
          throw new Error('Enter a valid year of completion.');
        }
        updates.completionYear = year;
      }
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'yearsOfExperience')) {
      if (updates.yearsOfExperience === '' || updates.yearsOfExperience === null) {
        updates.yearsOfExperience = null;
      } else {
        const years = Number(updates.yearsOfExperience);
        if (!Number.isFinite(years) || years < 0 || years > 60) {
          throw new Error('Experience must be between 0 and 60 years.');
        }
        updates.yearsOfExperience = years;
      }
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'contactNumber') &&
        updates.contactNumber &&
        !/^\+?[0-9() .-]{7,20}$/.test(updates.contactNumber)) {
      throw new Error('Enter a valid contact number.');
    }

    const user = await User.findOneAndUpdate(
      { _id: req.user.id, role: 'mentor', isActive: true },
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      mentor: serializeMentor(user)
    });
  } catch (error) {
    const isValidationError = error.name === 'ValidationError';
    return res.status(isValidationError || error.message ? 400 : 500).json({
      success: false,
      message: isValidationError ? 'Please check the profile details.' : error.message
    });
  }
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
  updateMentorProfile,
  getMentorsRoster
};
