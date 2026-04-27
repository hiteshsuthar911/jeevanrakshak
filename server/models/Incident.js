const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ['flood', 'cyclone', 'landslide', 'fire', 'waterlogging', 'earthquake', 'other'],
    required: true
  },
  description: { type: String },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    city: { type: String, required: true },
    address: { type: String }
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  assignedTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['open', 'active', 'resolved', 'closed'],
    default: 'open'
  },
  affectedPeople: { type: Number, default: 0 },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
}, { timestamps: true });

module.exports = mongoose.model('Incident', incidentSchema);
