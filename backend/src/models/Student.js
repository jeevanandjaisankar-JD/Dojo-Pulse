const mongoose = require('mongoose');

const SlotAttemptSchema = new mongoose.Schema({
  slotId: { type: String, required: true },
  language: {
    type: String,
    enum: ['Python', 'Node.js', 'Java', 'C++', 'JavaScript', 'Other'],
    default: 'Python'
  },
  verifiedBelts: { type: Number, default: 0 },
  beltLevel: { type: Number, default: 0 },
  beltsEarned: { type: Number, default: 0 },
  isImproved: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['IMPROVED', 'NO_IMPROVEMENT'],
    default: 'NO_IMPROVEMENT'
  },
  timestamp: { type: String, default: '' },
  time: { type: String, default: '' }
}, { _id: false });

const SameDayProgressSchema = new mongoose.Schema({
  date: { type: String, required: true },
  totalSlotsAttempted: { type: Number, default: 1 },
  languages: [{ type: String }],
  netBeltsEarned: { type: Number, default: 0 },
  isImproved: { type: Boolean, default: false },
  attempts: [SlotAttemptSchema]
}, { _id: false });

const StudentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  batch: { type: String, default: 'S.138' },
  mentorName: { type: String, default: 'Aravind' },
  verifiedBelts: { type: Number, default: 0 },
  currentBeltLevel: { type: Number, default: 0 },
  totalBeltsEarned: { type: Number, default: 0 },
  totalSlotsAttempted: { type: Number, default: 0 },
  improvementStatus: {
    type: String,
    enum: ['IMPROVED', 'NO_IMPROVEMENT'],
    default: 'NO_IMPROVEMENT'
  },
  languagesAttempted: [{ type: String }],
  sameDayProgress: [SameDayProgressSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', StudentSchema);
