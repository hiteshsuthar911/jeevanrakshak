import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/common/Layout';
import LeafletMap, { sosIcon, rescueIcon } from '../components/map/LeafletMap';
import { useSocket } from '../context/SocketContext';
import { sosAPI, usersAPI, weatherAPI, messageAPI } from '../services/api';
import toast from 'react-hot-toast';
import { ClipboardList, CheckCircle, Send, X, UserCheck, MapPin, CloudRain, Wind, Droplets, AlertTriangle, Users, Clock, Activity, RefreshCw, Package, Bell, CheckCircle2, XCircle } from 'lucide-react';

const EMOJI = { flood:'🌊',cyclone:'🌀',fire:'🔥',landslide:'⛰️',earthquake:'🌍',waterlogging:'💧',medical:'🏥',other:'⚠️',unknown:'🆘' };
const TABS  = ['pending','admin-confirmed','user-confirmed','dispatched'];
const TAB_LABELS = { pending:'Pending','admin-confirmed':'Awaiting User','user-confirmed':'Ready to Dispatch',dispatched:'Dispatched' };
const TAB_COLORS = { pending:'text-yellow-400 border-yellow-500/30 bg-yellow-500/10','admin-confirmed':'text-blue-300 border-blue-500/30 bg-blue-500/10','user-confirmed':'text-teal-300 border-teal-500/30 bg-teal-500/10',dispatched:'text-primary-300 border-primary-500/30 bg-primary-500/10' };

/* ── Modals ────────────────────────────────────────────── */
function ConfirmModal({ alert, onClose, onConfirm }) {
  const [notes, setNotes] = useState(alert.adminNotes || `Type: ${alert.disasterType}\nLocation: ${alert.location?.address||alert.location?.city}\nMsg: ${alert.message}`);
  const [saving, setSaving] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.95}}
        className="w-full max-w-lg card border border-primary-500/20" style={{background:'linear-gradient(135deg,#0a1628,#04080f)'}}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600/30 rounded-xl flex items-center justify-center"><ClipboardList className="w-5 h-5 text-primary-400"/></div>
            <div><div className="text-white font-bold">Review Request</div><div className="text-white/40 text-xs">From {alert.citizenName}</div></div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-white/50 hover:text-white"/></button>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{EMOJI[alert.disasterType]||'🆘'}</span>
            <div><div className="text-white font-semibold capitalize">{alert.disasterType} Emergency</div><div className="text-white/40 text-xs">{alert.citizenName} • {alert.citizenPhone}</div></div>
          </div>
          <div className="text-white/50 text-xs">{alert.location?.address||alert.location?.city}</div>
          {alert.message && <p className="text-white/60 text-sm mt-2 italic">"{alert.message}"</p>}
        </div>
        <div className="mb-4">
          <label className="label">Edit confirmed details (citizen will see this)</label>
          <textarea className="input resize-none text-sm" rows={5} value={notes} onChange={e=>setNotes(e.target.value)}/>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center py-3">Cancel</button>
          <button disabled={saving} onClick={async()=>{setSaving(true);try{await onConfirm(alert._id,notes)}finally{setSaving(false)}}} className="btn-primary flex-1 justify-center py-3">
            {saving?<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<><Send className="w-4 h-4"/>Confirm &amp; Notify</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function DispatchModal({ alert, rescueTeams, onClose, onDispatch }) {
  const [team, setTeam] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.95}}
        className="w-full max-w-md card border border-teal-500/20" style={{background:'linear-gradient(135deg,#0a1628,#04080f)'}}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600/30 rounded-xl flex items-center justify-center"><UserCheck className="w-5 h-5 text-teal-400"/></div>
            <div><div className="text-white font-bold">Dispatch Rescue Team</div><div className="text-white/40 text-xs">{alert.citizenName} • {EMOJI[alert.disasterType]} {alert.disasterType}</div></div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-white/50 hover:text-white"/></button>
        </div>
        <label className="label">Select Rescue Team</label>
        <div className="space-y-2 max-h-52 overflow-y-auto no-scrollbar mb-5">
          {rescueTeams.length===0
            ? <div className="text-white/30 text-sm text-center py-4">No rescue teams available</div>
            : rescueTeams.map(t=>(
              <button key={t._id} onClick={()=>setTeam(t._id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left
                  ${team===t._id?'bg-teal-500/20 border-teal-500/40 text-white':'border-white/5 bg-white/5 text-white/60 hover:text-white hover:border-white/10'}`}>
                <span className="text-xl">🚁</span>
                <div className="flex-1 min-w-0"><div className="font-semibold text-sm truncate">{t.teamName||t.name}</div><div className="text-xs opacity-60">{t.location?.city||'Unknown'}</div></div>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.status==='active'?'bg-teal-400':'bg-gray-500'}`}/>
              </button>
            ))
          }
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center py-3">Cancel</button>
          <button disabled={!team||busy} onClick={async()=>{setBusy(true);try{await onDispatch(alert._id,team)}finally{setBusy(false)}}} className="btn-teal flex-1 justify-center py-3 disabled:opacity-40">
            {busy?<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<><Send className="w-4 h-4"/>Dispatch</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Request List (shared by Requests + Dispatch tabs) ─── */
function RequestList({ alerts, tab, rescueTeams, onConfirm, onDispatch }) {
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [dispatchTarget, setDispatchTarget] = useState(null);
  return (
    <div className="space-y-3">
      {alerts.length===0
        ? <div className="text-center py-16 text-white/20 text-sm">No requests in this stage.</div>
        : alerts.map(a=>(
          <div key={a._id} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
            <span className="text-2xl flex-shrink-0">{EMOJI[a.disasterType]||'🆘'}</span>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-sm">{a.citizenName}</div>
              <div className="text-white/40 text-xs capitalize">{a.disasterType} • <MapPin className="w-3 h-3 inline"/>{a.location?.city}</div>
              {a.message&&<p className="text-white/40 text-xs mt-1 truncate italic">"{a.message}"</p>}
              {a.adminNotes&&tab!=='pending'&&<p className="text-primary-300/70 text-xs mt-1 truncate">📋 {a.adminNotes}</p>}
              {a.assignedTeam&&<p className="text-teal-400 text-xs mt-1">🚁 {a.assignedTeam.teamName||a.assignedTeam.name}</p>}
              <div className="text-white/20 text-xs mt-1">{new Date(a.createdAt).toLocaleString()}</div>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <span className={`badge-${tab}`}>{TAB_LABELS[tab]}</span>
              {tab==='pending'&&<button onClick={()=>setConfirmTarget(a)} className="text-xs px-3 py-1.5 rounded-lg bg-primary-600/20 text-primary-300 border border-primary-500/30 hover:bg-primary-600/30">Review</button>}
              {tab==='user-confirmed'&&<button onClick={()=>setDispatchTarget(a)} className="text-xs px-3 py-1.5 rounded-lg bg-teal-600/20 text-teal-300 border border-teal-500/30 hover:bg-teal-600/30">Dispatch</button>}
            </div>
          </div>
        ))
      }
      <AnimatePresence>
        {confirmTarget&&<ConfirmModal alert={confirmTarget} onClose={()=>setConfirmTarget(null)} onConfirm={async(id,notes)=>{await onConfirm(id,notes);setConfirmTarget(null)}}/>}
        {dispatchTarget&&<DispatchModal alert={dispatchTarget} rescueTeams={rescueTeams} onClose={()=>setDispatchTarget(null)} onDispatch={async(id,t)=>{await onDispatch(id,t);setDispatchTarget(null)}}/>}
      </AnimatePresence>
    </div>
  );
}

/* ── Views ─────────────────────────────────────────────── */
function OverviewView({ allAlerts, rescueTeams, weather, onlineTeams, loading, resourceRequests }) {
  const counts = TABS.reduce((a,t)=>({...a,[t]:allAlerts.filter(x=>x.status===t).length}),{});
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label:'Pending Requests',  value:counts.pending,           color:'text-yellow-400',  bg:'bg-yellow-500/10 border-yellow-500/20',  icon:ClipboardList},
          {label:'Awaiting User',     value:counts['admin-confirmed'],color:'text-blue-300',    bg:'bg-blue-500/10 border-blue-500/20',      icon:Clock},
          {label:'Ready to Dispatch', value:counts['user-confirmed'], color:'text-teal-300',    bg:'bg-teal-500/10 border-teal-500/20',      icon:CheckCircle},
          {label:'Teams Available',   value:rescueTeams.length,       color:'text-primary-400', bg:'bg-primary-500/10 border-primary-500/20', icon:Users},
        ].map(({label,value,color,bg,icon:Icon})=>(
          <motion.div key={label} className={`flex items-center gap-4 p-5 rounded-2xl border ${bg}`} whileHover={{scale:1.02}}>
            <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}><Icon className={`w-6 h-6 ${color}`}/></div>
            <div><div className={`text-2xl font-black ${color}`}>{loading?'—':value}</div><div className="text-white/40 text-xs">{label}</div></div>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent rescue requests */}
        <div className="lg:col-span-2 card">
          <h3 className="text-white font-bold mb-4">Recent Requests</h3>
          <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
            {allAlerts.slice(0,8).map(a=>(
              <div key={a._id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <span className="text-xl">{EMOJI[a.disasterType]||'🆘'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium">{a.citizenName}</div>
                  <div className="text-white/40 text-xs capitalize">{a.disasterType} • {a.location?.city}</div>
                </div>
                <span className={`badge-${a.status?.replace(/\s+/g,'-')} flex-shrink-0`}>{a.status}</span>
              </div>
            ))}
            {allAlerts.length===0&&<div className="text-center py-8 text-white/20 text-sm">No requests yet</div>}
          </div>
        </div>
        {/* Weather */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4"><CloudRain className="w-5 h-5 text-primary-400"/><span className="text-white font-bold">Weather</span></div>
          {weather?(
            <div className="space-y-3">
              <div className="text-center"><div className="text-4xl font-black text-white">{weather.temperature}°C</div><div className="text-white/50 capitalize mt-1">{weather.condition}</div></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 rounded-xl p-3 text-center"><Droplets className="w-4 h-4 text-primary-400 mx-auto mb-1"/><div className="text-white font-bold">{weather.humidity}%</div><div className="text-white/30 text-xs">Humidity</div></div>
                <div className="bg-white/5 rounded-xl p-3 text-center"><Wind className="w-4 h-4 text-teal-400 mx-auto mb-1"/><div className="text-white font-bold">{weather.windSpeed}km/h</div><div className="text-white/30 text-xs">Wind</div></div>
              </div>
              <div className="border-t border-white/5 pt-3">
                <div className="text-white/30 text-xs font-semibold uppercase mb-2">Teams Online ({onlineTeams.length})</div>
                {onlineTeams.length===0?<div className="text-white/20 text-xs">No teams broadcasting</div>
                  :onlineTeams.map(t=><div key={t.userId} className="flex items-center gap-2 py-1"><div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse"/><span className="text-white/60 text-xs truncate">{t.teamName}</span></div>)}
              </div>
            </div>
          ):<div className="space-y-2">{[60,40,80].map((w,i)=><div key={i} className="skeleton h-8 rounded-lg" style={{width:`${w}%`}}/>)}</div>}
        </div>
      </div>

      {/* ── Resource Requests from Rescue Teams ─────────── */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-orange-500/20 rounded-xl flex items-center justify-center">
            <Package className="w-4 h-4 text-orange-400"/>
          </div>
          <h3 className="text-white font-bold">Resource Requests from Rescue Teams</h3>
          {resourceRequests.filter(r => !r._accepted && !r._declined).length > 0 && (
            <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full">
              <Bell className="w-3 h-3"/> {resourceRequests.filter(r => !r._accepted && !r._declined).length} pending
            </span>
          )}
        </div>
        {resourceRequests.length === 0 ? (
          <div className="text-center py-8 text-white/20 text-sm">No resource requests from field teams.</div>
        ) : (
          <div className="space-y-3">
            {resourceRequests.map((req, i) => {
              const match = req.content?.match(/Need (\S+)\./);
              const resourceType = match ? match[1] : 'Resource';
              const note = req.content?.replace(/^.*?Need \S+\.\s*/, '') || '';
              const emoji = resourceType==='boat'?'🚤':resourceType==='ambulance'?'🚑':resourceType==='helicopter'?'🚁':resourceType==='food'?'🍱':resourceType==='medicine'?'💊':'📦';
              return (
                <motion.div key={req._id || i}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all
                    ${req._accepted ? 'bg-green-500/5 border-green-500/20 opacity-60'
                    : req._declined ? 'bg-red-500/5 border-red-500/20 opacity-50'
                    : 'bg-orange-500/5 border-orange-500/15'}`}>
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-white font-semibold text-sm capitalize">{resourceType} Requested</span>
                      {req._accepted && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400">✅ ACCEPTED</span>}
                      {req._declined && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400">❌ DECLINED</span>}
                      {!req._accepted && !req._declined && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400">PENDING</span>
                      )}
                    </div>
                    <div className="text-white/50 text-xs mb-0.5">From: <span className="text-white/70 font-medium">{req.from?.name || req.from?.teamName || 'Rescue Team'}</span></div>
                    {note && <p className="text-white/60 text-xs leading-relaxed mt-0.5">{note}</p>}
                    <div className="text-white/25 text-xs mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3"/>
                      {new Date(req.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                  {/* Action buttons */}
                  {!req._accepted && !req._declined && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => onAccept(req)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all">
                        <CheckCircle2 className="w-3.5 h-3.5"/> Accept
                      </button>
                      <button
                        onClick={() => onDecline(req)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                        <XCircle className="w-3.5 h-3.5"/> Decline
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function RequestsView({ allAlerts, rescueTeams, handleConfirm, handleDispatch, loading }) {
  const [activeTab, setActiveTab] = useState('pending');
  const counts = TABS.reduce((a,t)=>({...a,[t]:allAlerts.filter(x=>x.status===t).length}),{});
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map(tab=>(
          <button key={tab} onClick={()=>setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all
              ${activeTab===tab?TAB_COLORS[tab]:'border-white/5 text-white/30 hover:text-white/60 hover:border-white/10'}`}>
            {TAB_LABELS[tab]}
            {counts[tab]>0&&<span className="bg-white/20 rounded-full px-1.5">{counts[tab]}</span>}
          </button>
        ))}
      </div>
      <RequestList alerts={allAlerts.filter(a=>a.status===activeTab)} tab={activeTab} rescueTeams={rescueTeams} onConfirm={handleConfirm} onDispatch={handleDispatch}/>
    </div>
  );
}

function DispatchView({ allAlerts, rescueTeams, handleDispatch }) {
  const ready = allAlerts.filter(a=>a.status==='user-confirmed');
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white font-bold text-lg flex items-center gap-2"><UserCheck className="w-5 h-5 text-teal-400"/>Ready to Dispatch <span className="badge-user-confirmed">{ready.length}</span></h2>
      </div>
      <RequestList alerts={ready} tab="user-confirmed" rescueTeams={rescueTeams} onConfirm={async()=>{}} onDispatch={handleDispatch}/>
    </div>
  );
}

function MapView({ allAlerts, onlineTeams }) {
  const markers = [
    ...allAlerts.filter(a=>a.location?.lat&&a.status!=='resolved').map(a=>({id:a._id,lat:a.location.lat,lng:a.location.lng,icon:sosIcon,popup:`<b>🆘 ${a.citizenName}</b><br/>${a.disasterType} • ${a.location.city}<br/><span style="color:#0ea5e9">${a.status}</span>`})),
    ...onlineTeams.map(t=>({id:t.userId,lat:t.lat,lng:t.lng,icon:rescueIcon,popup:`<b>🚁 ${t.teamName}</b><br/>Status: ${t.status}`})),
  ];
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-4"><Activity className="w-5 h-5 text-primary-400"/><h2 className="text-white font-bold text-lg">Live Rescue Map</h2><div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse ml-1"/><span className="text-white/30 text-xs ml-auto">{markers.length} active pins</span></div>
      <div className="map-container" style={{height:'calc(100vh - 200px)'}}>
        <LeafletMap center={[20.5937,78.9629]} zoom={5} height="100%" markers={markers} fitMarkers={markers.length>0}/>
      </div>
    </div>
  );
}

/* ── Main Admin Page ────────────────────────────────────── */
export default function Admin() {
  const { onlineTeams, userConfirmedAlert, socket } = useSocket();
  const location = useLocation();
  const [allAlerts, setAllAlerts]         = useState([]);
  const [rescueTeams, setRescueTeams]     = useState([]);
  const [weather, setWeather]             = useState(null);
  const [resourceRequests, setResourceRequests] = useState([]);
  const [loading, setLoading]             = useState(true);

  const load = () => {
    Promise.all([
      sosAPI.getAll(),
      usersAPI.getByRole('rescue'),
      weatherAPI.get('Mumbai'),
      messageAPI.getAll(),
    ])
      .then(([sos, teams, w, msgs]) => {
        setAllAlerts(sos.data);
        setRescueTeams(teams.data);
        setWeather(w.data);
        setResourceRequests(msgs.data.filter(m => m.type === 'resource-request').reverse());
      })
      .catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!userConfirmedAlert) return;
    setAllAlerts(prev => prev.map(a => a._id === userConfirmedAlert._id ? userConfirmedAlert : a));
    toast('✅ Citizen confirmed! Ready to dispatch.', { icon: '🚁', duration: 6000 });
  }, [userConfirmedAlert]);

  // Real-time: rescue team resource request arrives
  useEffect(() => {
    if (!socket) return;
    const handler = (data) => {
      setResourceRequests(prev => [data, ...prev]);
      toast('📦 Resource request from rescue team!', { icon: '🚨', duration: 5000 });
    };
    socket.on('resource:requested', handler);
    return () => socket.off('resource:requested', handler);
  }, [socket]);

  const handleConfirm = async(alertId, adminNotes) => {
    const {data} = await sosAPI.adminConfirm(alertId, {adminNotes});
    setAllAlerts(prev => prev.map(a => a._id===alertId ? data : a));
    toast.success('✅ Confirmed & sent to citizen.');
  };
  const handleDispatch = async(alertId, teamId) => {
    const {data} = await sosAPI.dispatch(alertId, {assignedTeam:teamId});
    setAllAlerts(prev => prev.map(a => a._id===alertId ? data : a));
    const team = rescueTeams.find(t => t._id===teamId);
    toast.success(`🚁 ${team?.teamName||'Team'} dispatched!`);
  };

  const handleAcceptResource = async (req) => {
    const match = req.content?.match(/Need (\S+)\./);
    const resourceType = match ? match[1] : 'resource';
    try {
      // Send reply notification to rescue team
      await messageAPI.send({
        to: req.from?._id,
        content: `✅ Your ${resourceType} request has been accepted and is being arranged. Stand by.`,
        type: 'text',
      });
      await messageAPI.markRead(req._id);
      // Optimistic UI update — mark as accepted
      setResourceRequests(prev => prev.map(r =>
        r._id === req._id ? { ...r, _accepted: true } : r
      ));
      toast.success(`✅ ${resourceType} request accepted — rescue team notified!`);
    } catch { toast.error('Failed to accept request. Try again.'); }
  };

  const handleDeclineResource = async (req) => {
    const match = req.content?.match(/Need (\S+)\./);
    const resourceType = match ? match[1] : 'resource';
    try {
      await messageAPI.send({
        to: req.from?._id,
        content: `❌ Your ${resourceType} request could not be fulfilled at this time. Please try alternatives.`,
        type: 'text',
      });
      await messageAPI.markRead(req._id);
      setResourceRequests(prev => prev.map(r =>
        r._id === req._id ? { ...r, _declined: true } : r
      ));
      toast(`❌ ${resourceType} request declined — team notified.`, { icon: '⚠️' });
    } catch { toast.error('Failed to decline request.'); }
  };

  const path = location.pathname;
  const titles = {'/admin':'Overview','/admin/requests':'Requests','/admin/dispatch':'Dispatch','/admin/map':'Live Map','/admin/resources':'Resources','/admin/analytics':'Analytics'};

  return (
    <Layout title={titles[path]||'Command Center'}>
      <div className="animate-fade-in">
        {path==='/admin/map'      ? <MapView allAlerts={allAlerts} onlineTeams={onlineTeams}/> :
         path==='/admin/requests' ? <RequestsView allAlerts={allAlerts} rescueTeams={rescueTeams} handleConfirm={handleConfirm} handleDispatch={handleDispatch} loading={loading}/> :
         path==='/admin/dispatch' ? <DispatchView allAlerts={allAlerts} rescueTeams={rescueTeams} handleDispatch={handleDispatch}/> :
         <OverviewView allAlerts={allAlerts} rescueTeams={rescueTeams} weather={weather} onlineTeams={onlineTeams}
           loading={loading} resourceRequests={resourceRequests}
           onAccept={handleAcceptResource} onDecline={handleDeclineResource}/>
        }
      </div>
    </Layout>
  );
}
