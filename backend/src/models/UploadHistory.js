const mongoose = require('mongoose');

const UploadHistorySchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  filePath: { type: String, required: true },
  mimeType: { type: String, default: 'text/csv' },
  slotNumber: { type: Number, min: 1, default: 1 },
  uploadedBy: {
    id: { type: String, default: 'mentor-1' },
    name: { type: String, default: 'Aravind' },
    email: { type: String, default: 'aravind.r@kalvium.com' }
  },
  status: {
    type: String,
    enum: ['PROCESSING', 'COMPLETED', 'FAILED'],
    default: 'PROCESSING'
  },
  rowsProcessed: { type: Number, default: 0 },
  summary: {
    totalStudents: { type: Number, default: 0 },
    totalSlotsEvaluated: { type: Number, default: 0 },
    improved: { type: Number, default: 0 },
    notImproved: { type: Number, default: 0 },
    totalBeltsEarned: { type: Number, default: 0 },
    improvementRate: { type: Number, default: 0 },
    languages: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  errorMessage: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('UploadHistory', UploadHistorySchema);
