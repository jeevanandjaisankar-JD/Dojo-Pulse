
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['mentor', 'student']
  },
  professionalRole: {
    type: String,
    default: '',
    trim: true
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  squad: {
    type: String,
    default: null
  },
  surname: {
    type: String,
    default: '',
    trim: true
  },
  personalEmail: {
    type: String,
    default: '',
    lowercase: true,
    trim: true
  },
  linkedin: {
    type: String,
    default: '',
    trim: true
  },
  bio: {
    type: String,
    default: '',
    trim: true
  },
  educationalQualifications: {
    type: String,
    default: '',
    trim: true
  },
  yearOfJoining: {
    type: Number,
    default: null
  },

  // New mentor profile fields
  dateOfBirth: {
    type: Date,
    default: null
  },
  contactNumber: {
    type: String,
    default: '',
    trim: true
  },
  highestQualification: {
    type: String,
    default: '',
    trim: true
  },
  degreeSpecialization: {
    type: String,
    default: '',
    trim: true
  },
  institution: {
    type: String,
    default: '',
    trim: true
  },
  yearOfCompletion: {
    type: Number,
    default: null
  },
  areaOfExpertise: {
    type: String,
    default: '',
    trim: true
  },
  technicalSkills: {
    type: String,
    default: '',
    trim: true
  },
  yearsOfExperience: {
    type: Number,
    default: null
  },

  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
