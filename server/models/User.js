const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['citizen', 'rescue', 'admin'], default: 'citizen' },
  phone: { type: String },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    city: { type: String }
  },
  status: { type: String, enum: ['active', 'inactive', 'offline'], default: 'active' },
  teamName: { type: String },
  vehicleId: { type: String },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
