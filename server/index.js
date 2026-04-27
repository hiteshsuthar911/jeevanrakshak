require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const socketHandler = require('./socket/socketHandler');

// Routes
const authRouter = require('./routes/authRouter');
const incidentRoutes = require('./routes/incidents');
const sosRoutes = require('./routes/sos');
const resourceRoutes = require('./routes/resources');
const messageRoutes = require('./routes/messages');
const weatherRoutes = require('./routes/weather');

// Connect DB
connectDB();

const app = express();
const httpServer = http.createServer(app);

// Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true
  }
});
socketHandler(io);
app.set('io', io); // Make io accessible in routes via req.app.get('io')

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'JeevanRakshak API running 🚀', timestamp: new Date() });
});

// Public Stats for Landing Page
app.get('/api/stats', async (req, res) => {
  try {
    const Incident = require('./models/Incident');
    const User = require('./models/User');
    const [incidents, rescues, citizens] = await Promise.all([
      Incident.countDocuments({ status: { $ne: 'resolved' } }),
      User.countDocuments({ role: 'rescue' }),
      User.countDocuments({ role: 'citizen' })
    ]);
    res.json({
      activeIncidents: incidents,
      livesSaved: 0, // Placeholder or calculated from resolved incidents
      rescueTeams: rescues,
      statesCovered: 28 // Fixed or calculated
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api/incidents', incidentRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/weather', weatherRoutes);

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 JeevanRakshak API running at http://localhost:${PORT}`);
  console.log(`📡 Socket.io active`);
  console.log(`🌍 CORS: ${process.env.CLIENT_URL || 'http://localhost:5173'}\n`);
});

module.exports = { app, io };
