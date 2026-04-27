import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Layout from '../components/common/Layout';
import LeafletMap, { incidentIcon, rescueIcon, sosIcon } from '../components/map/LeafletMap';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { sosAPI, messageAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  MapPin, Navigation, CheckCircle, Clock, Package, Radio,
  Send, Activity, MessageSquare
} from 'lucide-react';

const disasterEmoji = {
  flood: '🌊', cyclone: '🌀', fire: '🔥', landslide: '⛰️',
  earthquake: '🌍', waterlogging: '💧', medical: '🏥', other: '⚠️', unknown: '⚠️'
};
const statusOptions = ['en-route', 'on-site', 'completed'];

/* ── Mission Dashboard ─────────────────────────────────── */
function MissionDashboard({ missions, user, broadcastLocation, messages, setMessages, sendMessage }) {
  const [selectedStatus, setSelectedStatus] = useState('en-route');
  const [broadcasting, setBroadcasting]   = useState(false);
  const [msgInput, setMsgInput]           = useState('');
  const [resourceForm, setResourceForm]   = useState({ type: 'boat', note: '' });
  const msgEndRef = useRef(null);

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const startGPS = () => {
    setBroadcasting(true);
    navigator.geolocation.watchPosition(
      ({ coords }) => broadcastLocation(coords.latitude, coords.longitude, selectedStatus),
      () => broadcastLocation(user?.location?.lat || 19.033, user?.location?.lng || 72.865, selectedStatus),
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    toast.success('📡 Broadcasting live location to Command');
  };

  const handleSend = async () => {
    if (!msgInput.trim()) return;
    try {
      const { data } = await messageAPI.send({ toRole: 'admin', content: msgInput, type: 'text' });
      sendMessage({ ...data, fromName: user?.name });
      setMessages(prev => [...prev, data]);
      setMsgInput('');
    } catch { toast.error('Message failed'); }
  };

  const handleResourceRequest = async () => {
    try {
      await messageAPI.send({ toRole: 'admin', content: `🚨 Resource Request: Need ${resourceForm.type}. ${resourceForm.note}`, type: 'resource-request' });
      toast.success('📦 Resource request sent to Command');
      setResourceForm({ type: 'boat', note: '' });
    } catch { toast.error('Failed to send request'); }
  };

  const markResolved = async (missionId) => {
    try {
      await sosAPI.update(missionId, { status: 'resolved' });
      toast.success('✅ Mission marked as resolved');
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Assigned Missions', value: missions.length,                                      color: 'text-primary-400', icon: '📋' },
          { label: 'Active',            value: missions.filter(m => m.status === 'dispatched').length, color: 'text-teal-400',   icon: '🔵' },
          { label: 'En Route',          value: selectedStatus === 'en-route' ? 1 : 0,                color: 'text-yellow-400',  icon: '🚗' },
          { label: 'My Status',         value: selectedStatus,                                       color: 'text-white',       icon: '📡' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="card">
            <div className="text-2xl mb-1">{icon}</div>
            <div className={`text-xl font-black ${color} capitalize`}>{value}</div>
            <div className="text-white/40 text-xs">{label}</div>
          </div>
        ))}
      </div>

      {/* Active Missions */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary-400" />
          <span className="text-white font-bold">Assigned Missions</span>
          <div className="ml-auto flex items-center gap-2">
            <select className="input py-1.5 text-sm w-auto" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
              {statusOptions.map(s => <option key={s} value={s} className="bg-surface-100 capitalize">{s}</option>)}
            </select>
            <button onClick={startGPS} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all
              ${broadcasting ? 'bg-teal-500/20 border-teal-500/30 text-teal-400' : 'bg-primary-600/20 border-primary-500/30 text-primary-400 hover:bg-primary-600/30'}`}>
              <Navigation className="w-3.5 h-3.5" />
              {broadcasting ? '📡 Live' : 'Start GPS'}
            </button>
          </div>
        </div>
        {missions.length === 0 ? (
          <div className="text-center py-10 text-white/20 text-sm">No missions assigned. Stand by for dispatch from Command.</div>
        ) : (
          <div className="space-y-3">
            {missions.map(m => (
              <div key={m._id} className="p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{disasterEmoji[m.disasterType] || '⚠️'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold">{m.citizenName}</div>
                    <div className="text-white/40 text-sm capitalize">{m.disasterType} Emergency</div>
                    <div className="text-white/30 text-xs flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />{m.location?.address || m.location?.city}
                    </div>
                    {m.message && <p className="text-white/50 text-xs mt-1 italic">"{m.message}"</p>}
                    {m.adminNotes && (
                      <div className="mt-2 bg-primary-600/10 border border-primary-500/20 rounded-lg p-2">
                        <div className="text-primary-300 text-xs font-semibold mb-0.5">📋 Admin Notes:</div>
                        <p className="text-white/70 text-xs">{m.adminNotes}</p>
                      </div>
                    )}
                    {m.citizenPhone && <div className="text-teal-400 text-xs mt-1">📞 {m.citizenPhone}</div>}
                  </div>
                  <button onClick={() => markResolved(m._id)}
                    className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg bg-teal-600/20 text-teal-300 border border-teal-500/30 hover:bg-teal-600/30 transition-all">
                    <CheckCircle className="w-3.5 h-3.5 inline mr-1" />Done
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Command Comms */}
        <div className="card flex flex-col" style={{ height: '380px' }}>
          <div className="flex items-center gap-2 mb-3 flex-shrink-0">
            <Radio className="w-4 h-4 text-primary-400" />
            <span className="text-white font-bold text-sm">Command Comms</span>
            <div className="ml-auto flex items-center gap-1 text-xs text-teal-400">
              <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" /> Live
            </div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 mb-3 pr-1">
            {messages.map((msg, i) => {
              const isMe = msg.from?._id === user?.id || msg.from === user?.id;
              return (
                <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm
                    ${isMe ? 'bg-primary-600 text-white rounded-br-sm' :
                      msg.type === 'broadcast' ? 'bg-primary-500/10 border border-primary-500/20 text-primary-100 rounded-bl-sm' :
                      'bg-white/10 text-white/80 rounded-bl-sm'}`}>
                    {!isMe && <div className="text-xs font-semibold opacity-60 mb-1">{msg.type === 'broadcast' ? '📢 BROADCAST' : msg.from?.name || 'Command'}</div>}
                    <div className="leading-relaxed">{msg.content}</div>
                    <div className="text-[10px] mt-1 opacity-40">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && <div className="text-center text-white/20 text-sm py-8">No messages yet. Channel open. 📡</div>}
            <div ref={msgEndRef} />
          </div>
          <div className="flex-shrink-0 flex gap-2">
            <input className="input flex-1 py-2.5 text-sm" placeholder="Type message..."
              value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
            <button onClick={handleSend} className="btn-primary px-4 py-2.5"><Send className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Resource Request */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-teal-400" />
            <span className="text-white font-bold text-sm">Request Resources</span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="label">Resource Type</label>
              <select className="input" value={resourceForm.type} onChange={e => setResourceForm({ ...resourceForm, type: e.target.value })}>
                {['boat', 'ambulance', 'helicopter', 'food', 'medicine', 'rescue-kit'].map(t => (
                  <option key={t} value={t} className="bg-surface-100 capitalize">{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Details & Urgency</label>
              <textarea className="input resize-none text-sm" rows={4}
                placeholder="Describe what you need and why..."
                value={resourceForm.note} onChange={e => setResourceForm({ ...resourceForm, note: e.target.value })} />
            </div>
            <button onClick={handleResourceRequest} className="btn-teal w-full justify-center">
              <Package className="w-4 h-4" /> Send Request to Command
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Mission Map View ────────────────────────────────────── */
function MissionMapView({ missions, user, broadcastLocation }) {
  const [broadcasting, setBroadcasting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('en-route');

  const startGPS = () => {
    setBroadcasting(true);
    navigator.geolocation.watchPosition(
      ({ coords }) => broadcastLocation(coords.latitude, coords.longitude, selectedStatus),
      () => broadcastLocation(user?.location?.lat || 19.033, user?.location?.lng || 72.865, selectedStatus),
    );
    toast.success('📡 Broadcasting live location');
  };

  const mapMarkers = [
    ...missions.filter(m => m.location?.lat).map(m => ({
      id: m._id, lat: m.location.lat, lng: m.location.lng, icon: sosIcon,
      popup: `<b>🆘 ${m.citizenName}</b><br/>${m.disasterType} • ${m.location.city}`
    })),
    ...(user?.location?.lat ? [{ id: 'me', lat: user.location.lat, lng: user.location.lng, icon: rescueIcon, popup: `<b>🚁 ${user.teamName || user.name}</b><br/>Your position` }] : [])
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-white font-bold text-lg">Mission Map</h2>
          <p className="text-white/40 text-xs">{missions.length} assigned missions</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="input py-2 text-sm w-auto" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            {statusOptions.map(s => <option key={s} value={s} className="bg-surface-100 capitalize">{s}</option>)}
          </select>
          <button onClick={startGPS} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all
            ${broadcasting ? 'bg-teal-500/20 border-teal-500/30 text-teal-400' : 'bg-primary-600/20 border-primary-500/30 text-primary-400 hover:bg-primary-600/30'}`}>
            <Navigation className="w-3.5 h-3.5" />{broadcasting ? '📡 Live' : 'Start GPS'}
          </button>
        </div>
      </div>
      <div className="map-container" style={{ height: '460px' }}>
        <LeafletMap center={[20.5937, 78.9629]} zoom={5} height="460px" markers={mapMarkers} fitMarkers={mapMarkers.length > 0} />
      </div>
    </div>
  );
}

/* ── Root Rescue Page ────────────────────────────────────── */
export default function Rescue() {
  const { user }                        = useAuth();
  const { broadcastLocation, sendMessage, dispatchedAlert } = useSocket();
  const location                        = useLocation();
  const [missions, setMissions]         = useState([]);
  const [messages, setMessages]         = useState([]);

  const load = () => {
    sosAPI.getAll().then(r => {
      setMissions(r.data.filter(a => a.status === 'dispatched' && a.assignedTeam?._id === user?.id || a.assignedTeam === user?.id));
    }).catch(() => {});
    messageAPI.getAll().then(r => setMessages(r.data.slice(0, 30).reverse())).catch(() => {});
  };

  useEffect(() => { if (user) load(); }, [user]);

  // Real-time: new dispatch
  useEffect(() => {
    if (!dispatchedAlert) return;
    setMissions(prev => {
      const exists = prev.find(m => m._id === dispatchedAlert._id);
      return exists ? prev : [dispatchedAlert, ...prev];
    });
    toast('🚁 New mission dispatched to your team!', { icon: '📋', duration: 8000 });
  }, [dispatchedAlert]);

  const path = location.pathname;
  const pageTitle = path === '/rescue/map' ? 'Mission Map' : path === '/rescue/messages' ? 'Command Comms' : 'Rescue Dashboard';

  return (
    <Layout title={pageTitle}>
      <div className="max-w-7xl mx-auto">
        {path === '/rescue/map' ? (
          <MissionMapView missions={missions} user={user} broadcastLocation={broadcastLocation} />
        ) : (
          <MissionDashboard missions={missions} user={user} broadcastLocation={broadcastLocation}
            messages={messages} setMessages={setMessages} sendMessage={sendMessage} />
        )}
      </div>
    </Layout>
  );
}
