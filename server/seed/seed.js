require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Incident = require('../models/Incident');
const SOSAlert = require('../models/SOSAlert');
const Resource = require('../models/Resource');
const Message = require('../models/Message');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jeevanrakshak';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('🌱 Connected to MongoDB. Seeding data...');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Incident.deleteMany({}),
    SOSAlert.deleteMany({}),
    Resource.deleteMany({}),
    Message.deleteMany({})
  ]);
  console.log('🗑️  Cleared existing data.');

  // ── USERS ──────────────────────────────────────────────────
  // Admin
  const admin = await User.create({
    name: 'Cmd. Arjun Sharma',
    email: 'admin@jeevanrakshak.in',
    password: 'Admin@1234',
    role: 'admin',
    phone: '+91 9800100001',
    location: { lat: 19.076, lng: 72.8777, city: 'Mumbai' },
    status: 'active'
  });

  // Rescue Teams
  const rescue1 = await User.create({
    name: 'Priya Nair',
    email: 'rescue1@jeevanrakshak.in',
    password: 'Rescue@1234',
    role: 'rescue',
    phone: '+91 9800100002',
    teamName: 'Alpha Squad — Mumbai NDRF',
    vehicleId: 'MH-01-R-001',
    location: { lat: 19.033, lng: 72.8656, city: 'Mumbai' },
    status: 'active'
  });

  const rescue2 = await User.create({
    name: 'Ravi Kumar',
    email: 'rescue2@jeevanrakshak.in',
    password: 'Rescue@1234',
    role: 'rescue',
    phone: '+91 9800100003',
    teamName: 'Bravo Unit — Chennai SDRF',
    vehicleId: 'TN-09-R-007',
    location: { lat: 13.0827, lng: 80.2707, city: 'Chennai' },
    status: 'active'
  });

  const rescue3 = await User.create({
    name: 'Sunita Panda',
    email: 'rescue3@jeevanrakshak.in',
    password: 'Rescue@1234',
    role: 'rescue',
    phone: '+91 9800100004',
    teamName: 'Charlie Force — Odisha Cyclone Relief',
    vehicleId: 'OD-04-R-013',
    location: { lat: 20.2961, lng: 85.8245, city: 'Bhubaneswar' },
    status: 'active'
  });

  // Citizens — hash password manually since insertMany bypasses pre-save hooks
  const citizenPassword = await bcrypt.hash('Pass@1234', 12);
  const citizens = await User.insertMany([
    { name: 'Amit Verma',     email: 'citizen1@jr.in', password: citizenPassword, role: 'citizen', phone: '+91 9100000001', location: { lat: 19.041,  lng: 72.879,  city: 'Mumbai'   } },
    { name: 'Kavya Iyer',     email: 'citizen2@jr.in', password: citizenPassword, role: 'citizen', phone: '+91 9100000002', location: { lat: 13.041,  lng: 80.233,  city: 'Chennai'  } },
    { name: 'Ramesh Babu',    email: 'citizen3@jr.in', password: citizenPassword, role: 'citizen', phone: '+91 9100000003', location: { lat: 26.1445, lng: 91.7362, city: 'Guwahati' } },
    { name: 'Sana Rizvi',     email: 'citizen4@jr.in', password: citizenPassword, role: 'citizen', phone: '+91 9100000004', location: { lat: 19.99,   lng: 73.789,  city: 'Nashik'   } },
    { name: 'Deepak Rao',     email: 'citizen5@jr.in', password: citizenPassword, role: 'citizen', phone: '+91 9100000005', location: { lat: 20.461,  lng: 85.883,  city: 'Cuttack'  } },
    { name: 'Meena Devi',     email: 'citizen6@jr.in', password: citizenPassword, role: 'citizen', phone: '+91 9100000006', location: { lat: 22.572,  lng: 88.363,  city: 'Kolkata'  } },
    { name: 'Suresh Pillai',  email: 'citizen7@jr.in', password: citizenPassword, role: 'citizen', phone: '+91 9100000007', location: { lat: 9.9312,  lng: 76.2673, city: 'Kochi'    } },
    { name: 'Anjali Singh',   email: 'citizen8@jr.in', password: citizenPassword, role: 'citizen', phone: '+91 9100000008', location: { lat: 26.449,  lng: 80.331,  city: 'Kanpur'   } },
    { name: 'Vinod Gowda',    email: 'citizen9@jr.in', password: citizenPassword, role: 'citizen', phone: '+91 9100000009', location: { lat: 12.971,  lng: 77.594,  city: 'Bengaluru'} },
    { name: 'Pooja Sharma',   email: 'citizen10@jr.in', password: citizenPassword, role: 'citizen', phone: '+91 9100000010', location: { lat: 28.704, lng: 77.102,  city: 'Delhi'    } },
  ]);

  console.log('✅ Users created.');

  // ── INCIDENTS ──────────────────────────────────────────────
  const incidents = await Incident.insertMany([
    {
      title: 'Severe Monsoon Flooding — Dharavi',
      type: 'flood',
      description: 'Heavy monsoon rains have caused severe flooding in Dharavi slums. Water level rising rapidly. Hundreds of residents trapped.',
      location: { lat: 19.041, lng: 72.858, city: 'Mumbai', address: 'Dharavi, Sion, Mumbai' },
      severity: 'critical',
      assignedTeam: rescue1._id,
      status: 'active',
      affectedPeople: 2400,
      reportedBy: admin._id
    },
    {
      title: 'Cyclone Tej — Coastal Surge Alert',
      type: 'cyclone',
      description: 'Cyclone Tej making landfall near Puri. Storm surge of 3-4m expected. Coastal villages to be evacuated immediately.',
      location: { lat: 19.812, lng: 85.832, city: 'Puri', address: 'Puri Coastline, Odisha' },
      severity: 'critical',
      assignedTeam: rescue3._id,
      status: 'active',
      affectedPeople: 8500,
      reportedBy: admin._id
    },
    {
      title: 'Urban Waterlogging — Anna Nagar',
      type: 'waterlogging',
      description: 'Intense rainfall causing extensive waterlogging in Anna Nagar residential area. Roads blocked, vehicles stranded.',
      location: { lat: 13.085, lng: 80.209, city: 'Chennai', address: 'Anna Nagar, Chennai' },
      severity: 'high',
      assignedTeam: rescue2._id,
      status: 'active',
      affectedPeople: 650,
      reportedBy: admin._id
    },
    {
      title: 'Assam Landslide — NH 27 Blockage',
      type: 'landslide',
      description: 'Major landslide near Guwahati on NH-27. Multiple vehicles buried under rubble. Road blocked for 12km.',
      location: { lat: 26.185, lng: 91.681, city: 'Guwahati', address: 'NH-27, Near Jalukbari Flyover' },
      severity: 'high',
      status: 'open',
      affectedPeople: 300,
      reportedBy: admin._id
    },
    {
      title: 'Industrial Fire — Thane Chemical Zone',
      type: 'fire',
      description: 'Fire breaks out in chemical storage facility. Hazmat team required. Nearby residents being evacuated.',
      location: { lat: 19.218, lng: 72.978, city: 'Thane', address: 'MIDC Thane, Chemical Zone' },
      severity: 'medium',
      status: 'open',
      affectedPeople: 120,
      reportedBy: admin._id
    }
  ]);

  console.log('✅ Incidents created.');

  // ── SOS ALERTS ─────────────────────────────────────────────
  const now = new Date();
  await SOSAlert.insertMany([
    { citizen: citizens[0]._id, citizenName: citizens[0].name, citizenPhone: citizens[0].phone, location: { lat: 19.038, lng: 72.875, city: 'Mumbai' },  message: 'House flooded, water neck-deep, cant escape!',        disasterType: 'flood',   status: 'pending',      createdAt: new Date(now - 3e5) },
    { citizen: citizens[1]._id, citizenName: citizens[1].name, citizenPhone: citizens[1].phone, location: { lat: 13.045, lng: 80.24,  city: 'Chennai' }, message: 'My family is stuck on rooftop, roads blocked',       disasterType: 'waterlogging', status: 'acknowledged', createdAt: new Date(now - 6e5) },
    { citizen: citizens[2]._id, citizenName: citizens[2].name, citizenPhone: citizens[2].phone, location: { lat: 26.15,  lng: 91.73,  city: 'Guwahati'},message: 'Landslide blocked our road, no food or water',        disasterType: 'landslide', status: 'pending',     createdAt: new Date(now - 12e5) },
    { citizen: citizens[4]._id, citizenName: citizens[4].name, citizenPhone: citizens[4].phone, location: { lat: 20.45,  lng: 85.88,  city: 'Cuttack' }, message: 'Storm surge — water rising fast in my area',         disasterType: 'cyclone', status: 'pending',      createdAt: new Date(now - 18e5) },
    { citizen: citizens[5]._id, citizenName: citizens[5].name, citizenPhone: citizens[5].phone, location: { lat: 22.57,  lng: 88.36,  city: 'Kolkata' }, message: 'High fever, need medical help, roads flooded',       disasterType: 'flood',   status: 'resolved',     createdAt: new Date(now - 36e5) },
    { citizen: citizens[3]._id, citizenName: citizens[3].name, citizenPhone: citizens[3].phone, location: { lat: 19.99,  lng: 73.79,  city: 'Nashik'  }, message: 'Tree fell on my car, trapped inside the vehicle',    disasterType: 'other',   status: 'acknowledged', createdAt: new Date(now - 24e5) },
    { citizen: citizens[6]._id, citizenName: citizens[6].name, citizenPhone: citizens[6].phone, location: { lat: 9.93,   lng: 76.27,  city: 'Kochi'   }, message: 'Fire in neighbouring building, no way out',          disasterType: 'fire',    status: 'resolved',     createdAt: new Date(now - 72e5) },
    { citizen: citizens[7]._id, citizenName: citizens[7].name, citizenPhone: citizens[7].phone, location: { lat: 26.45,  lng: 80.33,  city: 'Kanpur'  }, message: 'Electric pole fell in flooded street, danger!',      disasterType: 'flood',   status: 'pending',      createdAt: new Date(now - 9e5) },
    { citizen: citizens[8]._id, citizenName: citizens[8].name, citizenPhone: citizens[8].phone, location: { lat: 12.97,  lng: 77.59,  city: 'Bengaluru'},message: 'Basement apartment flooded, baby inside!',           disasterType: 'flood',   status: 'acknowledged', createdAt: new Date(now - 15e5) },
    { citizen: citizens[9]._id, citizenName: citizens[9].name, citizenPhone: citizens[9].phone, location: { lat: 28.70,  lng: 77.10,  city: 'Delhi'   }, message: 'Yamuna overflow near my colony, help needed urgently',disasterType: 'flood',   status: 'pending',      createdAt: new Date(now - 4e5) },
  ]);

  console.log('✅ SOS Alerts created.');

  // ── RESOURCES ──────────────────────────────────────────────
  await Resource.insertMany([
    { type: 'boat',        name: 'Inflatable Rescue Boat MH-01', quantity: 1, location: { lat: 19.033, lng: 72.865, city: 'Mumbai'     }, assignedTeam: rescue1._id, status: 'deployed', description: 'NDRF high-capacity inflatable boat, 12-person' },
    { type: 'boat',        name: 'Motor Boat OD-04',             quantity: 1, location: { lat: 20.296, lng: 85.824, city: 'Bhubaneswar' }, assignedTeam: rescue3._id, status: 'deployed', description: 'Motorized rescue boat for cyclone relief' },
    { type: 'ambulance',   name: 'Ambulance TN-09-A-001',        quantity: 1, location: { lat: 13.082, lng: 80.27,  city: 'Chennai'     }, assignedTeam: rescue2._id, status: 'deployed', description: 'ALS Ambulance with defibrillator' },
    { type: 'ambulance',   name: 'Ambulance MH-01-A-007',        quantity: 1, location: { lat: 19.218, lng: 72.978, city: 'Thane'       }, status: 'available', description: 'BLS Ambulance' },
    { type: 'helicopter',  name: 'HAL Dhruv Rescue — RJ-1',      quantity: 1, location: { lat: 26.82,  lng: 75.8,   city: 'Jaipur'      }, status: 'available', description: 'Multi-role rescue helicopter, 14 capacity' },
    { type: 'helicopter',  name: 'Coast Guard ALH — OD-1',       quantity: 1, location: { lat: 20.296, lng: 85.824, city: 'Bhubaneswar' }, status: 'deployed', description: 'Coastal rescue ALH Dhruv' },
    { type: 'food',        name: 'Emergency Food Kits — Mumbai',  quantity: 500, location: { lat: 19.076, lng: 72.877, city: 'Mumbai'   }, status: 'available', description: '3-day emergency ration kits' },
    { type: 'medicine',    name: 'Medical Supplies Cache — Chennai', quantity: 200, location: { lat: 13.082, lng: 80.27, city: 'Chennai'}, status: 'available', description: 'First aid + ORS + antibiotics' },
    { type: 'shelter',     name: 'Relief Camp — Puri Cyclone',    quantity: 1, location: { lat: 19.812, lng: 85.832, city: 'Puri'       }, status: 'deployed', description: 'Temporary shelter for 800 people' },
    { type: 'rescue-kit',  name: 'Urban Search & Rescue Kit',     quantity: 3, location: { lat: 28.704, lng: 77.102, city: 'Delhi'      }, status: 'available', description: 'Rope, harness, thermal camera, hydraulic spreader' },
  ]);

  console.log('✅ Resources created.');

  // ── MESSAGES ───────────────────────────────────────────────
  await Message.insertMany([
    { from: admin._id, toRole: 'all', content: '🚨 HIGH ALERT: Cyclone Tej landfall expected in 6 hours. All coastal residents in Odisha please evacuate immediately to designated shelters.', type: 'broadcast' },
    { from: admin._id, toRole: 'rescue', content: 'Alpha Squad: Prioritize Dharavi Zone 3. Water level at 4 feet. Use inflatable boats. Backup arriving in 45 mins.', type: 'alert' },
    { from: rescue1._id, to: admin._id, content: 'Zone 3 reached. Evacuating 200+ residents. Requesting 2 more boats urgently.', type: 'resource-request' },
    { from: rescue2._id, to: admin._id, content: 'Anna Nagar waterlogging cleared 60%. 3 roads still blocked. Need pump vehicles.', type: 'text' },
    { from: admin._id, toRole: 'all', content: '⚠️ Flood Warning: Yamuna river above danger mark in Delhi. Citizens near Yamuna floodplains must evacuate NOW.', type: 'broadcast' },
  ]);

  console.log('✅ Messages seeded.');
  console.log('\n🎉 Database seeded successfully!\n');
  console.log('─────────────────────────────────────────');
  console.log('🔑 LOGIN CREDENTIALS:');
  console.log('  Admin:   admin@jeevanrakshak.in / Admin@1234');
  console.log('  Rescue1: rescue1@jeevanrakshak.in / Rescue@1234');
  console.log('  Rescue2: rescue2@jeevanrakshak.in / Rescue@1234');
  console.log('  Rescue3: rescue3@jeevanrakshak.in / Rescue@1234');
  console.log('  Citizen: citizen1@jr.in / Pass@1234');
  console.log('─────────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
