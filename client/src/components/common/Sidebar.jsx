import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home, Map, Bell, Shield, LogOut,
  ChevronLeft, ChevronRight, ClipboardList,
  Radio, Truck, BarChart2, Users, Activity, Send
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = {
  citizen: [
    { to: '/citizen',        icon: Home,          label: 'Dashboard' },
    { to: '/citizen/requests', icon: ClipboardList, label: 'My Requests' },
    { to: '/citizen/alerts', icon: Bell,          label: 'Alerts' },
  ],
  rescue: [
    { to: '/rescue',          icon: Home,  label: 'Dashboard' },
    { to: '/rescue/map',      icon: Map,   label: 'Mission Map' },
    { to: '/rescue/messages', icon: Radio, label: 'Command Comms' },
  ],
  admin: [
    { to: '/admin',           icon: Home,          label: 'Overview' },
    { to: '/admin/requests',  icon: ClipboardList, label: 'Requests' },
    { to: '/admin/dispatch',  icon: Send,          label: 'Dispatch' },
    { to: '/admin/map',       icon: Map,           label: 'Live Map' },
    { to: '/admin/resources', icon: Truck,         label: 'Resources' },
    { to: '/admin/analytics', icon: BarChart2,     label: 'Analytics' },
  ],
};

const roleLabels = {
  citizen: { label: 'Citizen Portal',  icon: Users,  color: 'text-primary-400' },
  rescue:  { label: 'Rescue Team',     icon: Truck,  color: 'text-teal-400' },
  admin:   { label: 'Command Center',  icon: Shield, color: 'text-primary-300' },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const items   = navItems[user.role] || [];
  const roleInfo = roleLabels[user.role];
  const RoleIcon = roleInfo?.icon || Shield;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative h-screen flex flex-col border-r border-white/5 flex-shrink-0 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a1628 0%, #04080f 100%)' }}
    >
      {/* Logo */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 glow-sm">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
              >
                <div className="text-white font-black text-lg leading-tight">JeevanRakshak</div>
                <div className="text-white/30 text-xs">Disaster Response Platform</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Role Badge */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="mx-4 mt-4 p-3 rounded-xl border border-primary-500/20"
            style={{ background: 'rgba(14,165,233,0.06)' }}
          >
            <div className="flex items-center gap-2">
              <RoleIcon className={`w-4 h-4 ${roleInfo?.color}`} />
              <span className={`text-xs font-semibold ${roleInfo?.color}`}>{roleInfo?.label}</span>
            </div>
            <div className="text-white text-sm font-semibold mt-1 truncate">{user.name}</div>
            <div className="text-white/40 text-xs truncate">{user.email}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav Items */}
      <nav className="flex-1 p-3 space-y-1 mt-2 overflow-y-auto no-scrollbar">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            end={to === '/citizen' || to === '/rescue' || to === '/admin'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm">
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/5">
        <button onClick={handleLogout}
          className={`sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 ${collapsed ? 'justify-center px-2' : ''}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm">
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse Toggle */}
      <button onClick={() => setCollapsed(!collapsed)}
        className="absolute top-1/2 -right-3.5 w-7 h-7 bg-surface-200 border border-white/10 rounded-full
                   flex items-center justify-center text-white/60 hover:text-white transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </motion.aside>
  );
}
