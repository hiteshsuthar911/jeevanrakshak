import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/common/Layout';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { sosAPI, messageAPI, incidentAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  AlertTriangle, MapPin, Clock, CheckCircle,
  Radio, Send, RefreshCw, Bell, X, ChevronRight, ChevronLeft,
  Siren, Shield, Flame, Wind
} from 'lucide-react';

const disasterTypes = [
  { id: 'flood',       label: 'Flood',      emoji: '🌊', active: 'border-blue-500 bg-blue-500/20',     base: 'border-blue-500/30 bg-blue-500/8' },
  { id: 'cyclone',     label: 'Cyclone',    emoji: '🌀', active: 'border-indigo-500 bg-indigo-500/20', base: 'border-indigo-500/30 bg-indigo-500/8' },
  { id: 'fire',        label: 'Fire',       emoji: '🔥', active: 'border-orange-500 bg-orange-500/20', base: 'border-orange-500/30 bg-orange-500/8' },
  { id: 'landslide',   label: 'Landslide',  emoji: '⛰️', active: 'border-yellow-500 bg-yellow-500/20', base: 'border-yellow-500/30 bg-yellow-500/8' },
  { id: 'earthquake',  label: 'Earthquake', emoji: '🌍', active: 'border-red-500 bg-red-500/20',       base: 'border-red-500/30 bg-red-500/8' },
  { id: 'waterlogging',label: 'Waterlog',   emoji: '💧', active: 'border-cyan-500 bg-cyan-500/20',     base: 'border-cyan-500/30 bg-cyan-500/8' },
  { id: 'medical',     label: 'Medical',    emoji: '🏥', active: 'border-pink-500 bg-pink-500/20',     base: 'border-pink-500/30 bg-pink-500/8' },
  { id: 'other',       label: 'Other',      emoji: '⚠️', active: 'border-gray-400 bg-gray-500/20',    base: 'border-gray-500/30 bg-gray-500/8' },
];

const STEPS = ['Submitted', 'Admin Reviewed', 'You Confirmed', 'Rescue Dispatched'];
const statusToStep = { 'pending': 0, 'admin-confirmed': 1, 'user-confirmed': 2, 'dispatched': 3, 'resolved': 4 };

const incidentEmoji = { flood:'🌊', cyclone:'🌀', fire:'🔥', landslide:'⛰️', earthquake:'🌍', waterlogging:'💧', medical:'🏥', other:'⚠️' };
const severityColor = { critical:'text-red-400 border-red-500/30 bg-red-500/10', high:'text-orange-400 border-orange-500/30 bg-orange-500/10', medium:'text-yellow-400 border-yellow-500/30 bg-yellow-500/10', low:'text-green-400 border-green-500/30 bg-green-500/10' };

/* ── Alert Feed Component ─────────────────────────────────── */
function AlertFeed({ incidents, messages }) {
  // Merge incidents + broadcasts into one chronological feed
  const feed = [
    ...incidents.filter(i => i.status !== 'resolved').map(i => ({
      id: i._id, type: 'incident', time: new Date(i.createdAt),
      title: i.title || `${i.type} Incident`,
      body: `${i.affectedPeople ? i.affectedPeople + ' people affected • ' : ''}${i.location?.city || ''}`,
      severity: i.severity, emoji: incidentEmoji[i.type] || '⚠️',
    })),
    ...messages.map(m => ({
      id: m._id, type: 'broadcast', time: new Date(m.createdAt),
      title: 'Authority Broadcast',
      body: m.content,
      severity: 'medium', emoji: '📢',
      author: m.from?.name,
    })),
  ].sort((a, b) => b.time - a.time);

  if (feed.length === 0) {
    return (
      <div className="text-center py-10 text-white/20 text-sm">
        <Shield className="w-8 h-8 mx-auto mb-2 opacity-20" />
        No active alerts in your area. Stay safe! ✅
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {feed.map((item) => (
        <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          className={`flex items-start gap-3 p-4 rounded-xl border transition-all
            ${item.type === 'broadcast'
              ? 'bg-primary-500/5 border-primary-500/20'
              : `border ${severityColor[item.severity]?.split(' ').slice(2).join(' ') || 'border-white/5 bg-white/5'}`
            }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg
            ${item.type === 'broadcast' ? 'bg-primary-600/20' : 'bg-white/5'}`}>
            {item.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-white font-semibold text-sm">{item.title}</span>
              {item.severity && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${severityColor[item.severity] || ''}`}>
                  {item.severity}
                </span>
              )}
              {item.type === 'broadcast' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary-500/30 bg-primary-500/10 text-primary-300">BROADCAST</span>
              )}
            </div>
            <p className="text-white/60 text-xs leading-relaxed">{item.body}</p>
            {item.author && <div className="text-white/30 text-xs mt-0.5">— {item.author}</div>}
            <div className="text-white/25 text-xs mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {item.time.toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function StatusTracker({ status }) {
  const current = statusToStep[status] ?? 0;
  return (
    <div className="flex items-center gap-0 mt-4">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1 min-w-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all flex-shrink-0
              ${i < current ? 'bg-teal-500 border-teal-400 text-white' :
                i === current ? 'bg-primary-600 border-primary-400 text-white ring-4 ring-primary-500/20' :
                'bg-white/5 border-white/10 text-white/30'}`}>
              {i < current ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <div className={`text-[9px] mt-1.5 text-center leading-tight px-0.5 hidden sm:block
              ${i <= current ? 'text-white/60' : 'text-white/20'}`}>{s}</div>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 flex-1 mx-0.5 mb-4 transition-all ${i < current ? 'bg-teal-500' : 'bg-white/10'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Request Submission Modal ─────────────────────────────── */
function RequestModal({ onClose, onSubmit, loading }) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-md rounded-3xl border border-primary-500/20 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a1628 0%, #04080f 100%)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-black">Send Rescue Request</div>
              <div className="text-white/40 text-xs">Step {step} of 2</div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6">
              <p className="text-white/60 text-sm mb-4 text-center">What type of disaster are you facing?</p>
              <div className="grid grid-cols-4 gap-2 mb-6">
                {disasterTypes.map(d => (
                  <button key={d.id} onClick={() => setSelected(d)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all
                      ${selected?.id === d.id ? d.active : d.base}`}>
                    <span className="text-2xl">{d.emoji}</span>
                    <span className="text-xs font-semibold text-white/80 text-center leading-tight">{d.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => selected && setStep(2)} disabled={!selected}
                className="btn-primary w-full justify-center disabled:opacity-30">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6">
              <div className={`flex items-center gap-3 p-3 rounded-2xl border-2 mb-4 ${selected.active}`}>
                <span className="text-2xl">{selected.emoji}</span>
                <div className="flex-1">
                  <div className="text-white font-bold text-sm">{selected.label} Emergency</div>
                  <div className="text-white/40 text-xs">Admin will review and confirm</div>
                </div>
                <button onClick={() => setStep(1)} className="text-primary-400 text-xs underline">Change</button>
              </div>
              <div className="space-y-3 mb-5">
                <div>
                  <label className="label">Your Location / Address</label>
                  <input className="input text-sm" placeholder="e.g. House No. 12, Dharavi, Mumbai"
                    value={address} onChange={e => setAddress(e.target.value)} />
                </div>
                <div>
                  <label className="label">Describe your situation</label>
                  <textarea className="input resize-none text-sm" rows={3}
                    placeholder="e.g. Water rising fast, 3 people stuck on 2nd floor..."
                    value={note} onChange={e => setNote(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-white/30 text-xs mb-5">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                Your GPS location will be shared automatically
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center py-3">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => onSubmit(selected.id, address, note)} disabled={loading}
                  className="btn-primary flex-1 justify-center py-3">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Send</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/* ── Dashboard View ─────────────────────────────────────── */
function DashboardView({ myAlerts, pendingConfirm, confirming, handleCitizenConfirm, setShowModal, incidents, messages }) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Confirmation banner */}
      {pendingConfirm.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-primary-500/40 p-5"
          style={{ background: 'rgba(14,165,233,0.08)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
            <span className="text-primary-300 font-bold text-sm">⚡ Action Required — Admin Reviewed Your Request</span>
          </div>
          {pendingConfirm.map(alert => (
            <div key={alert._id} className="bg-white/5 rounded-xl p-4 mt-2">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{disasterTypes.find(d => d.id === alert.disasterType)?.emoji || '⚠️'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold capitalize">{alert.disasterType} Emergency</div>
                  {alert.adminNotes && (
                    <div className="mt-2 bg-primary-600/10 border border-primary-500/20 rounded-xl p-3">
                      <div className="text-primary-300 text-xs font-semibold mb-1">📋 Admin Notes:</div>
                      <p className="text-white/80 text-sm">{alert.adminNotes}</p>
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => handleCitizenConfirm(alert._id)} disabled={confirming === alert._id}
                className="btn-primary mt-3 py-2 text-sm justify-center w-full">
                {confirming === alert._id
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><CheckCircle className="w-4 h-4" /> Yes, Details are Correct — Dispatch Rescue</>}
              </button>
            </div>
          ))}
        </motion.div>
      )}

      {/* Request Button */}
      <div className="card text-center relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.06) 0%, transparent 70%)' }} />
        <div className="relative">
          <h2 className="text-white font-bold text-xl mb-1">Need Emergency Help?</h2>
          <p className="text-white/40 text-sm mb-6">Select disaster type, describe your situation — we'll connect you with help</p>
          <div className="flex justify-center mb-4">
            <motion.button onClick={() => setShowModal(true)} className="btn-sos" whileTap={{ scale: 0.95 }}>
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-black">HELP</span>
                <span className="text-xs font-semibold">REQUEST RESCUE</span>
              </div>
            </motion.button>
          </div>
          <div className="flex items-center justify-center gap-4 text-white/25 text-xs flex-wrap pt-2">
            {['Submit request', 'Admin reviews', 'You confirm', 'Team dispatched'].map((s, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="text-primary-500 font-bold">{i + 1}.</span> {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Two-column: Recent Requests + Live Alert Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Recent Requests */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-primary-400" /> My Requests
            </h3>
            <span className="badge-pending">{myAlerts.filter(a => a.status !== 'resolved').length} active</span>
          </div>
          {myAlerts.length === 0 ? (
            <div className="text-center py-8 text-white/20 text-sm">No requests yet</div>
          ) : myAlerts.slice(0, 4).map(alert => (
            <div key={alert._id} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
              <span className="text-xl">{disasterTypes.find(d => d.id === alert.disasterType)?.emoji || '⚠️'}</span>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium capitalize">{alert.disasterType} Emergency</div>
                <div className="text-white/30 text-xs">{new Date(alert.createdAt).toLocaleString()}</div>
              </div>
              <span className={`badge-${alert.status?.replace(/\s+/g, '-')} flex-shrink-0 text-xs`}>{alert.status}</span>
            </div>
          ))}
        </div>

        {/* Live Alert Feed */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <h3 className="text-white font-bold flex items-center gap-2">
              <Siren className="w-4 h-4 text-red-400" /> Live Alert Feed
            </h3>
            <span className="text-white/20 text-xs ml-auto">{incidents.filter(i=>i.status!=='resolved').length + messages.length} alerts</span>
          </div>
          <div className="max-h-64 overflow-y-auto no-scrollbar">
            <AlertFeed incidents={incidents} messages={messages} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── My Requests View ────────────────────────────────────── */
function MyRequestsView({ myAlerts, confirming, handleCitizenConfirm, load }) {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-white font-bold text-lg">My Rescue Requests</h2>
        <button onClick={load} className="text-white/30 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      {myAlerts.length === 0 ? (
        <div className="card text-center py-16 text-white/20">No rescue requests yet. Go to Dashboard to send one.</div>
      ) : myAlerts.map(alert => (
        <div key={alert._id} className="card border border-white/5">
          <div className="flex items-start gap-4">
            <span className="text-3xl">{disasterTypes.find(d => d.id === alert.disasterType)?.emoji || '⚠️'}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-bold capitalize">{alert.disasterType} Emergency</span>
                <span className={`badge-${alert.status?.replace(/\s+/g, '-')}`}>{alert.status}</span>
              </div>
              <div className="text-white/40 text-xs flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />{alert.location?.address || alert.location?.city || 'Unknown'}
              </div>
              <div className="text-white/30 text-xs flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />{new Date(alert.createdAt).toLocaleString()}
              </div>
              {alert.message && <p className="text-white/50 text-xs mt-2 italic">"{alert.message}"</p>}
              {alert.adminNotes && (
                <div className="mt-2 bg-primary-600/10 border border-primary-500/20 rounded-lg p-2.5">
                  <div className="text-primary-300 text-xs font-semibold">📋 Admin Notes</div>
                  <p className="text-white/70 text-xs mt-0.5">{alert.adminNotes}</p>
                </div>
              )}
              {alert.assignedTeam && (
                <div className="text-teal-400 text-xs mt-2 font-semibold">
                  🚁 {alert.assignedTeam.teamName || alert.assignedTeam.name} has been dispatched
                </div>
              )}
            </div>
          </div>
          <StatusTracker status={alert.status} />
          {alert.status === 'admin-confirmed' && (
            <button onClick={() => handleCitizenConfirm(alert._id)} disabled={confirming === alert._id}
              className="btn-primary mt-4 py-2.5 text-sm w-full justify-center">
              {confirming === alert._id
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><CheckCircle className="w-4 h-4" /> Confirm Details &amp; Dispatch Rescue</>}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Alerts View ──────────────────────────────────────────── */
function AlertsView({ messages, incidents, load }) {
  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <Siren className="w-5 h-5 text-red-400" /> Live Alert Feed
          </h2>
          <p className="text-white/30 text-xs mt-0.5">
            {activeIncidents.length} active incidents • {messages.length} broadcasts
          </p>
        </div>
        <button onClick={load} className="text-white/30 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active Incidents', value: activeIncidents.length,                                          color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'Broadcasts',       value: messages.length,                                                  color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/20' },
          { label: 'Critical',         value: activeIncidents.filter(i => i.severity === 'critical').length,    color: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/20' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-2xl border p-4 text-center ${bg}`}>
            <div className={`text-2xl font-black ${color}`}>{value}</div>
            <div className="text-white/40 text-xs mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Combined feed */}
      <div className="card">
        <AlertFeed incidents={incidents} messages={messages} />
      </div>
    </div>
  );
}

/* ── Root Citizen Page ────────────────────────────────────── */
export default function Citizen() {
  const { user } = useAuth();
  const { sendSOS, adminConfirmedAlert } = useSocket();
  const location = useLocation();
  const [myAlerts, setMyAlerts]     = useState([]);
  const [messages, setMessages]     = useState([]);
  const [incidents, setIncidents]   = useState([]);
  const [showModal, setShowModal]   = useState(false);
  const [sending, setSending]       = useState(false);
  const [confirming, setConfirming] = useState(null);

  const load = () => {
    sosAPI.getMy().then(r => setMyAlerts(r.data)).catch(() => {});
    messageAPI.getAll().then(r => setMessages(r.data.filter(m => m.type === 'broadcast'))).catch(() => {});
    incidentAPI.getAll().then(r => setIncidents(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!adminConfirmedAlert) return;
    setMyAlerts(prev => prev.map(a => a._id === adminConfirmedAlert._id ? adminConfirmedAlert : a));
    toast('📋 Admin reviewed your request! Please confirm.', { icon: '🔔', duration: 8000 });
  }, [adminConfirmedAlert]);

  const handleSubmit = (disasterType, address, note) => {
    setSending(true);
    const doSend = (lat, lng) => {
      const payload = {
        location: { lat, lng, city: user?.location?.city || 'Unknown', address },
        message: note || `${disasterType} emergency. Need immediate help.`,
        disasterType,
      };
      sosAPI.send(payload)
        .then(({ data }) => {
          sendSOS({ ...data, citizenName: user?.name });
          setMyAlerts(prev => [data, ...prev]);
          setShowModal(false);
          toast.success('✅ Request sent! Admin will review shortly.');
        })
        .catch(() => toast.error('Failed to send request.'))
        .finally(() => setSending(false));
    };
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => doSend(coords.latitude, coords.longitude),
      () => doSend(user?.location?.lat || 19.076, user?.location?.lng || 72.877),
      { timeout: 5000 }
    );
  };

  const handleCitizenConfirm = async (alertId) => {
    setConfirming(alertId);
    try {
      const { data } = await sosAPI.citizenConfirm(alertId);
      setMyAlerts(prev => prev.map(a => a._id === alertId ? data : a));
      toast.success('✅ Confirmed! Rescue team will be dispatched soon.');
    } catch { toast.error('Confirmation failed. Try again.'); }
    finally { setConfirming(null); }
  };

  const pendingConfirm = myAlerts.filter(a => a.status === 'admin-confirmed');

  const path = location.pathname;
  const pageTitle = path === '/citizen/requests' ? 'My Requests' : path === '/citizen/alerts' ? 'Alerts & Updates' : 'Citizen Dashboard';

  return (
    <Layout title={pageTitle}>
      <div className="animate-fade-in">
        {path === '/citizen/requests' ? (
          <MyRequestsView myAlerts={myAlerts} confirming={confirming} handleCitizenConfirm={handleCitizenConfirm} load={load} />
        ) : path === '/citizen/alerts' ? (
          <AlertsView messages={messages} incidents={incidents} load={load} />
        ) : (
          <DashboardView myAlerts={myAlerts} pendingConfirm={pendingConfirm} confirming={confirming}
            handleCitizenConfirm={handleCitizenConfirm} setShowModal={setShowModal}
            incidents={incidents} messages={messages} />
        )}
      </div>
      <AnimatePresence>
        {showModal && <RequestModal onClose={() => !sending && setShowModal(false)} onSubmit={handleSubmit} loading={sending} />}
      </AnimatePresence>
    </Layout>
  );
}
