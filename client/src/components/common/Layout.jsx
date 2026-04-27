import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import { useAuth } from '../../context/AuthContext';
import { Wifi, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

const roleColors = {
  citizen: 'text-blue-400',
  rescue: 'text-orange-400',
  admin: 'text-red-400',
};

export default function Layout({ children, title }) {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex h-screen bg-dark-400 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-white/5 px-6 flex items-center justify-between flex-shrink-0"
          style={{ background: 'rgba(10,10,31,0.8)', backdropFilter: 'blur(10px)' }}>
          <div>
            <h1 className="text-white font-bold text-lg">{title}</h1>
            <div className="flex items-center gap-1.5">
              <span className="status-dot status-dot-active" />
              <span className={`text-xs font-medium ${roleColors[user?.role]}`}>
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} • {user?.teamName || user?.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live clock */}
            <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-3 py-2">
              <Clock className="w-3.5 h-3.5 text-white/40" />
              <span className="text-white/60 text-xs font-mono">
                {time.toLocaleTimeString('en-IN', { hour12: true })}
              </span>
            </div>
            {/* Connection status */}
            <div className="hidden md:flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
              <Wifi className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400 text-xs font-semibold">Live</span>
            </div>
            <NotificationBell />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
