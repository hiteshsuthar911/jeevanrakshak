const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema({
  citizen:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  citizenName:  { type: String },
  citizenPhone: { type: String },
  location: {
    lat:     { type: Number, required: true },
    lng:     { type: Number, required: true },
    city:    { type: String },
    address: { type: String }
  },
  message:      { type: String, default: 'Emergency! Need immediate help.' },
  disasterType: { type: String, default: 'unknown' },

  // Multi-step workflow statuses
  status: {
    type: String,
    enum: ['pending', 'admin-confirmed', 'user-confirmed', 'dispatched', 'resolved', 'rejected'],
    default: 'pending'
  },

  // Admin adds notes/corrections before sending back to citizen
  adminNotes:      { type: String },
  acknowledgedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Citizen confirms admin's summary
  confirmedByUser: { type: Boolean, default: false },
  userConfirmedAt: { type: Date },

  // Rescue dispatch
  assignedTeam:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dispatchedAt:  { type: Date },

  resolvedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('SOSAlert', sosAlertSchema);
