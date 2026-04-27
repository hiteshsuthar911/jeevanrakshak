import { createContext, useContext, useEffect, useState } from 'react';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket]         = useState(null);
  const [onlineTeams, setOnlineTeams] = useState([]);
  const [newSOS, setNewSOS]           = useState(null);
  const [liveAlerts, setLiveAlerts]   = useState([]);

  // New workflow events
  const [adminConfirmedAlert, setAdminConfirmedAlert] = useState(null);
  const [userConfirmedAlert, setUserConfirmedAlert]   = useState(null);
  const [dispatchedAlert, setDispatchedAlert]         = useState(null);

  useEffect(() => {
    if (!user) return;
    const s = getSocket();
    setSocket(s);

    // Admin: live rescue team locations
    if (user.role === 'admin') {
      s.emit('admin:getLocations');
      s.on('admin:allLocations', (locs) => setOnlineTeams(locs));
      s.on('location:update', (data) => {
        setOnlineTeams((prev) => {
          const idx = prev.findIndex((t) => t.userId === data.userId);
          if (idx >= 0) { const n = [...prev]; n[idx] = data; return n; }
          return [...prev, data];
        });
      });
      s.on('rescue:offline', ({ userId }) =>
        setOnlineTeams((prev) => prev.filter((t) => t.userId !== userId))
      );
      // Admin gets notified when citizen confirms
      s.on('sos:user-confirmed', (alert) => setUserConfirmedAlert(alert));
    }

    // Citizen gets notified when admin confirms their request
    if (user.role === 'citizen') {
      s.on('sos:admin-confirmed', (alert) => setAdminConfirmedAlert(alert));
      s.on('sos:dispatched',      (alert) => setDispatchedAlert(alert));
    }

    // Rescue team gets dispatched alert
    if (user.role === 'rescue') {
      s.on('sos:dispatched', (alert) => setDispatchedAlert(alert));
    }

    // All: new SOS
    s.on('sos:new', (data) => {
      setNewSOS(data);
      setLiveAlerts((prev) => [data, ...prev.slice(0, 9)]);
    });

    return () => {
      s.off('admin:allLocations');
      s.off('location:update');
      s.off('rescue:offline');
      s.off('sos:new');
      s.off('sos:admin-confirmed');
      s.off('sos:user-confirmed');
      s.off('sos:dispatched');
    };
  }, [user]);

  const broadcastLocation = (lat, lng, status) => {
    if (socket && user) {
      socket.emit('rescue:location', {
        userId: user.id,
        teamName: user.teamName || user.name,
        lat, lng, status: status || 'active'
      });
    }
  };

  const sendSOS      = (data)    => { if (socket) socket.emit('sos:send', data); };
  const sendMessage  = (data)    => { if (socket) socket.emit('message:send', data); };
  const broadcastAlert = (data)  => { if (socket) socket.emit('broadcast:alert', data); };

  return (
    <SocketContext.Provider value={{
      socket, onlineTeams, newSOS, liveAlerts,
      adminConfirmedAlert, userConfirmedAlert, dispatchedAlert,
      broadcastLocation, sendSOS, sendMessage, broadcastAlert
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext) ?? {
  socket: null, onlineTeams: [], newSOS: null, liveAlerts: [],
  adminConfirmedAlert: null, userConfirmedAlert: null, dispatchedAlert: null,
  broadcastLocation: () => {}, sendSOS: () => {}, sendMessage: () => {}, broadcastAlert: () => {},
};
