import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import LeafletMap, { sosIcon, rescueIcon, incidentIcon } from '../../components/map/LeafletMap';
import { useSocket } from '../../context/SocketContext';
import { incidentAPI, sosAPI } from '../../services/api';
import { MapPin, Filter, Eye, EyeOff } from 'lucide-react';

export default function AdminMap() {
  const { onlineTeams } = useSocket();
  const [incidents, setIncidents] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [filters, setFilters] = useState({ sos: true, incidents: true, teams: true, zones: true });
  const [selectedCity, setSelectedCity] = useState('all');

  useEffect(() => {
    incidentAPI.getAll().then(r => setIncidents(r.data)).catch(() => {});
    sosAPI.getAll().then(r => setSosAlerts(r.data)).catch(() => {});
  }, []);

  const cities = ['all', 'Mumbai', 'Chennai', 'Bhubaneswar', 'Guwahati', 'Delhi', 'Kolkata'];

  const mapMarkers = [
    ...(filters.incidents ? incidents.filter(i => i.location?.lat && (selectedCity === 'all' || i.location.city === selectedCity)).map(i => ({
      id: i._id, lat: i.location.lat, lng: i.location.lng, icon: incidentIcon,
      popup: `<b>⚠️ ${i.title}</b><br/><span style="color:#ef4444">${i.severity?.toUpperCase()}</span> • ${i.status}<br/>${i.location.city}<br/><small>${i.affectedPeople} affected</small>`
    })) : []),
    ...(filters.sos ? sosAlerts.filter(s => s.location?.lat && s.status === 'pending').map(s => ({
      id: s._id, lat: s.location.lat, lng: s.location.lng, icon: sosIcon,
      popup: `<b>🆘 ${s.citizenName}</b><br/>📞 ${s.citizenPhone || 'N/A'}<br/>${s.location.city}<br/><em>${s.message}</em>`
    })) : []),
    ...(filters.teams ? onlineTeams.map(t => ({
      id: t.userId, lat: t.lat, lng: t.lng, icon: rescueIcon,
      popup: `<b>🚁 ${t.teamName}</b><br/>Status: ${t.status}`
    })) : []),
  ];

  const circles = filters.zones ? incidents.filter(i => i.location?.lat).map(i => ({
    lat: i.location.lat, lng: i.location.lng,
    radius: i.severity === 'critical' ? 15000 : i.severity === 'high' ? 8000 : 4000,
    severity: i.severity, label: i.title
  })) : [];

  const toggle = (key) => setFilters(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <Layout title="Live Tracking Map">
      <div className="h-full flex flex-col gap-4" style={{ height: 'calc(100vh - 130px)' }}>
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <Filter className="w-4 h-4" />
            <span>Filters:</span>
          </div>
          {Object.entries(filters).map(([key, val]) => (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                val ? 'bg-primary-600/20 border-primary-500/30 text-primary-300' : 'border-white/10 text-white/30'
              }`}
            >
              {val ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <MapPin className="w-4 h-4 text-white/30" />
            <select
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white text-sm outline-none"
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
            >
              {cities.map(c => <option key={c} value={c} className="bg-surface-100">{c === 'all' ? 'All Cities' : c}</option>)}
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 flex-wrap">
          {[
            { icon: '🆘', label: `SOS Alerts (${sosAlerts.filter(s => s.status === 'pending').length} pending)` },
            { icon: '⚠️', label: `Incidents (${incidents.length} total)` },
            { icon: '🚁', label: `Rescue Teams (${onlineTeams.length} online)` },
            { color: 'bg-red-500/50', label: 'Critical zone' },
            { color: 'bg-orange-500/50', label: 'High risk zone' },
            { color: 'bg-yellow-500/50', label: 'Medium zone' },
          ].map(({ icon, color, label }, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-white/50">
              {icon ? <span>{icon}</span> : <div className={`w-3 h-3 rounded-full ${color}`} />}
              {label}
            </div>
          ))}
        </div>

        {/* Full map */}
        <div className="flex-1 map-container min-h-0">
          <LeafletMap
            center={[20.5937, 78.9629]}
            zoom={5}
            height="100%"
            markers={mapMarkers}
            circles={circles}
            fitMarkers={mapMarkers.length > 0}
          />
        </div>
      </div>
    </Layout>
  );
}
