const mongoose = require('mongoose');

const BeltTestRecordSchema = new mongoose.Schema({
  // Unique ID supplied by the original belt_test.csv export.
  testId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },

  startTime: { type: String, default: '' },
  calculatedEndTime: { type: String, default: '' },
  beltTestUpdatedAt: { type: String, default: '' },

  studentName: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  squadNumber: { type: String, default: '', trim: true },

  initialBeltLevels: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  finalBeltLevels: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },

  uploadedBy: {
    id: { type: String, default: '' },
    name: { type: String, default: '' },
    email: { type: String, default: '' }
  },

  sourceFilename: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('BeltTestRecord', BeltTestRecordSchema);