const socketHandler = (io) => {
  // Track connected rescue teams for live location
  const rescueTeams = {};

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join role-based rooms
    socket.on('join:room', ({ userId, role }) => {
      socket.join(role); // Join role room (admin, rescue, citizen)
      socket.join(`user:${userId}`); // Join personal room
      socket.userId = userId;
      socket.userRole = role;
      console.log(`👤 User ${userId} joined room: ${role}`);
    });

    // Rescue team broadcasts their live GPS location
    socket.on('rescue:location', (data) => {
      // data = { userId, teamName, lat, lng, status }
      rescueTeams[data.userId] = { ...data, socketId: socket.id, updatedAt: new Date() };
      // Broadcast to all admins
      io.to('admin').emit('location:update', rescueTeams[data.userId]);
    });

    // Get all current rescue locations (admin requesting on connect)
    socket.on('admin:getLocations', () => {
      socket.emit('admin:allLocations', Object.values(rescueTeams));
    });

    // New SOS alert from citizen — notify all admins
    socket.on('sos:send', (alertData) => {
      io.to('admin').emit('sos:new', alertData);
      io.to('rescue').emit('sos:new', alertData);
      console.log(`🆘 New SOS from ${alertData.citizenName}`);
    });

    // Incident status update — broadcast across all roles
    socket.on('incident:update', (incidentData) => {
      io.emit('incident:updated', incidentData);
    });

    // Bidirectional message
    socket.on('message:send', (messageData) => {
      // messageData = { from, fromName, to, toRole, content, type }
      if (messageData.to) {
        io.to(`user:${messageData.to}`).emit('message:new', messageData);
      }
      if (messageData.toRole) {
        io.to(messageData.toRole).emit('message:new', messageData);
      }
    });

    // Admin broadcasts alert to all citizens
    socket.on('broadcast:alert', (data) => {
      io.to('citizen').emit('alert:broadcast', data);
      console.log(`📢 Admin broadcast: ${data.content}`);
    });

    // Resource request from rescue team
    socket.on('resource:request', (data) => {
      io.to('admin').emit('resource:requested', { ...data, rescueSocketId: socket.id });
    });

    socket.on('disconnect', () => {
      if (socket.userId && socket.userRole === 'rescue') {
        delete rescueTeams[socket.userId];
        io.to('admin').emit('rescue:offline', { userId: socket.userId });
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
