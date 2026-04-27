require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jeevanrakshak';

const createTestUsers = async (shouldDisconnect = true) => {
  // Use existing connection if available
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(MONGO_URI);
  }
  
  console.log('🌱 Creating/Updating test users...');

  // Helper to create or update user correctly triggering hooks
  const upsertUser = async (email, data) => {
    let user = await User.findOne({ email });
    if (user) {
      Object.assign(user, data);
    } else {
      user = new User({ email, ...data });
    }
    await user.save(); // This triggers the pre-save password hashing hook
    return user;
  };

  // Create Citizen
  await upsertUser('citizen@jr.in', {
    name: 'Amit Kumar',
    password: 'Pass@1234',
    role: 'citizen',
    phone: '+91 9100000001',
    location: { lat: 19.041, lng: 72.879, city: 'Mumbai' }
  });

  // Create Rescue Team
  await upsertUser('rescue@jr.in', {
    name: 'Priya Nair',
    password: 'Rescue@1234',
    role: 'rescue',
    phone: '+91 9800100002',
    teamName: 'Alpha Squad — Mumbai NDRF',
    vehicleId: 'MH-01-R-001',
    location: { lat: 19.033, lng: 72.8656, city: 'Mumbai' },
    status: 'active'
  });

  // Create Admin
  await upsertUser('admin@jeevanrakshak.in', {
    name: 'JeevanRakshak Admin',
    password: 'Admin@1234',
    role: 'admin',
    phone: '+91 9000000000'
  });

  console.log('✅ Citizen created/updated: citizen@jr.in / Pass@1234');
  console.log('✅ Rescue Team created/updated: rescue@jr.in / Rescue@1234');
  console.log('✅ Admin: admin@jeevanrakshak.in / Admin@1234');

  if (shouldDisconnect) {
    await mongoose.disconnect();
  }
};

module.exports = createTestUsers;

if (require.main === module) {
  createTestUsers(true).then(() => process.exit(0)).catch(err => {
    console.error('❌ Error creating test users:', err);
    process.exit(1);
  });
}
