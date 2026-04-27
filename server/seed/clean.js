require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Incident = require('../models/Incident');
const SOSAlert = require('../models/SOSAlert');
const Resource = require('../models/Resource');
const Message = require('../models/Message');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jeevanrakshak';

const clean = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('🌱 Connected to MongoDB. Cleaning data...');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Incident.deleteMany({}),
    SOSAlert.deleteMany({}),
    Resource.deleteMany({}),
    Message.deleteMany({})
  ]);
  console.log('🗑️  Cleared all existing data.');

  // Create default Admin
  await User.create({
    name: 'Admin Commander',
    email: 'admin@jeevanrakshak.in',
    password: 'Admin@1234', // This will be hashed by pre-save hook in User model
    role: 'admin',
    phone: '+91 9800100001',
    location: { lat: 19.076, lng: 72.8777, city: 'Mumbai' },
    status: 'active'
  });

  console.log('✅ Default Admin created: admin@jeevanrakshak.in / Admin@1234');
  console.log('\n🎉 Database cleaned successfully!\n');

  await mongoose.disconnect();
  process.exit(0);
};

clean().catch(err => {
  console.error('❌ Clean error:', err);
  process.exit(1);
});
