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
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  squad: {
    type: String,
    default: null
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  contactNumber: {
    type: String,
    default: '',
    trim: true
  },
  qualification: {
    type: String,
    default: '',
    trim: true
  },
  degree: {
    type: String,
    default: '',
    trim: true
  },
  institution: {
    type: String,
    default: '',
    trim: true
  },
  completionYear: {
    type: Number,
    default: null
  },
  designation: {
    type: String,
    default: '',
    trim: true
  },
  expertise: {
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
    default: null,
    min: 0,
    max: 60
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
