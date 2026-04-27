const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['boat', 'ambulance', 'helicopter', 'food', 'medicine', 'shelter', 'vehicle', 'rescue-kit'],
    required: true
  },
  name: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    city: { type: String }
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident' },
  assignedTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['available', 'deployed', 'maintenance'],
    default: 'available'
  },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
