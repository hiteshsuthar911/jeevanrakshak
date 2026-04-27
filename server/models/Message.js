const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  toRole: { type: String, enum: ['citizen', 'rescue', 'admin', 'all'] },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'alert', 'broadcast', 'resource-request'], default: 'text' },
  read: { type: Boolean, default: false },
  incidentRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident' },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
