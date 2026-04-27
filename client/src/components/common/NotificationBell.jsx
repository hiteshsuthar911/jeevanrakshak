import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck, AlertTriangle, Radio, Siren } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { messageAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const typeIcons = {
  broadcast: AlertTriangle,
  alert: Siren,
  'resource-request': Radio,
  text: Bell,
};

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export default function NotificationBell() {
  const { user } = useAuth();
  const { liveAlerts } = useSocket();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const fetchMessages = async () => {
    try {
      const [msgs, unreadRes] = await Promise.all([
        messageAPI.getAll(),
        messageAPI.getUnread()
      ]);
      setMessages(msgs.data.slice(0, 10));
      setUnread(unreadRes.data.count + liveAlerts.length);
    } catch {}
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, [liveAlerts]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen(!open);
    if (!open) setUnread(0);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl
                   flex items-center justify-center transition-all duration-200"
      >
        <Bell className="w-5 h-5 text-white/70" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary-600 text-white text-[10px]
                       font-bold rounded-full flex items-center justify-center"
          >
            {unread > 9 ? '9+' : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 card-glass border border-white/10 rounded-2xl z-50 shadow-2xl overflow-hidden"
            style={{ background: 'rgba(15,15,31,0.98)', backdropFilter: 'blur(20px)' }}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary-400" />
                <span className="text-white font-semibold text-sm">Notifications</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-white/40 hover:text-white/70 transition-colors text-xs flex items-center gap-1">
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all
                </button>
                <button onClick={() => setOpen(false)}><X className="w-4 h-4 text-white/40 hover:text-white" /></button>
              </div>
            </div>

            <div className="divide-y divide-white/5 max-h-80 overflow-y-auto no-scrollbar">
              {/* Live SOS alerts */}
              {liveAlerts.slice(0, 3).map((alert, i) => (
                <div key={i} className="p-4 bg-red-500/5 hover:bg-red-500/10 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Siren className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-semibold">🆘 Live SOS Alert</div>
                      <div className="text-white/60 text-xs mt-0.5 line-clamp-2">{alert.citizenName} — {alert.location?.city}</div>
                      <div className="text-red-400 text-[10px] mt-1">just now • live</div>
                    </div>
                  </div>
                </div>
              ))}

              {messages.map((msg) => {
                const Icon = typeIcons[msg.type] || Bell;
                return (
                  <div key={msg._id} className="p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-white/60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white/80 text-xs font-semibold truncate">
                          {msg.from?.name || 'System'}
                          {msg.type === 'broadcast' && <span className="ml-1 badge-critical">BROADCAST</span>}
                        </div>
                        <div className="text-white/50 text-xs mt-0.5 line-clamp-2">{msg.content}</div>
                        <div className="text-white/30 text-[10px] mt-1">{timeAgo(msg.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {messages.length === 0 && liveAlerts.length === 0 && (
                <div className="p-8 text-center text-white/30 text-sm">No notifications</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
