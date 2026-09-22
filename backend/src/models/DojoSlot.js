const mongoose = require('mongoose');

const DojoSlotSchema = new mongoose.Schema({
  slotId: { type: String, required: true, unique: true },
  language: { type: String, default: 'Python' },
  conductedDate: { type: Date, default: Date.now },
  totalParticipants: { type: Number, default: 0 },
  improvedCount: { type: Number, default: 0 },
  notImprovedCount: { type: Number, default: 0 },
  beltsEarned: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('DojoSlot', DojoSlotSchema);
