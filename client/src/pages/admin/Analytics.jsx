import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { incidentAPI, sosAPI } from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { BarChart2, Activity, AlertTriangle, TrendingUp, RefreshCw, MapPin, Clock, Users } from 'lucide-react';

const COLORS = ['#0ea5e9', '#14b8a6', '#f59e0b', '#22c55e', '#8b5cf6', '#ec4899', '#f97316', '#ef4444'];
const SEVERITY_COLORS = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#22c55e' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-200 border border-white/10 rounded-xl p-3 text-sm shadow-xl">
      <div className="text-white/60 mb-1 text-xs">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="font-bold text-xs" style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

/* ── Helpers ──────────────────────────────────────────────── */
function groupByField(arr, field) {
  return arr.reduce((acc, item) => {
    const key = item[field] || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function groupByMonth(arr, dateField = 'createdAt') {
  const months = {};
  arr.forEach(item => {
    const d = new Date(item[dateField]);
    const key = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
    months[key] = (months[key] || 0) + 1;
  });
  // Return last 6 months in order
  return Object.entries(months).slice(-6).map(([month, count]) => ({ month, count }));
}

function groupByCity(arr) {
  return arr.reduce((acc, item) => {
    const city = item.location?.city || 'Unknown';
    if (!acc[city]) acc[city] = { city, count: 0, critical: 0 };
    acc[city].count++;
    if (item.severity === 'critical') acc[city].critical++;
    return acc;
  }, {});
}

/* ── Stat Card ───────────────────────────────────────────── */
function StatCard({ label, value, color, sub, loading }) {
  return (
    <div className={`rounded-2xl border p-5 ${color}`}>
      <div className="text-3xl font-black text-white mb-1">{loading ? '—' : value}</div>
      <div className="text-white/50 text-sm">{label}</div>
      {sub && <div className="text-white/30 text-xs mt-1">{sub}</div>}
    </div>
  );
}

export default function Analytics() {
  const [incidents, setIncidents] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = () => {
    setLoading(true);
    Promise.all([incidentAPI.getAll(), sosAPI.getAll()])
      .then(([inc, sos]) => { setIncidents(inc.data); setSosAlerts(sos.data); setLastRefresh(new Date()); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  /* ── Computed stats ──────────────────────────── */
  const totalIncidents = incidents.length;
  const activeIncidents = incidents.filter(i => i.status !== 'resolved').length;
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;

  const sosPending    = sosAlerts.filter(s => s.status === 'pending').length;
  const sosDispatched = sosAlerts.filter(s => s.status === 'dispatched').length;
  const sosResolved   = sosAlerts.filter(s => s.status === 'resolved').length;

  /* ── Chart data (all live) ───────────────────── */

  // Pie: Incident type breakdown
  const typeBreakdown = groupByField(incidents, 'type');
  const pieData = Object.entries(typeBreakdown).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1), value,
  }));

  // Bar: SOS by disaster type
  const sosTypeBreakdown = groupByField(sosAlerts, 'disasterType');
  const sosTypeData = Object.entries(sosTypeBreakdown).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1), count: value,
  })).sort((a, b) => b.count - a.count);

  // Severity distribution
  const severityData = ['critical', 'high', 'medium', 'low'].map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: incidents.filter(i => i.severity === s).length,
    color: SEVERITY_COLORS[s],
  }));

  // Monthly incident trend
  const monthlyData = groupByMonth(incidents);

  // Monthly SOS trend
  const monthlySOS = groupByMonth(sosAlerts);

  // City-wise incident count (live from DB)
  const cityMap = groupByCity(incidents);
  const cityData = Object.values(cityMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // SOS status breakdown for stacked bar
  const sosStatusData = [
    { name: 'Pending',    value: sosPending,    fill: '#f59e0b' },
    { name: 'Dispatched', value: sosDispatched,  fill: '#0ea5e9' },
    { name: 'Resolved',   value: sosResolved,    fill: '#22c55e' },
  ];

  const hasIncidents = incidents.length > 0;
  const hasSOS = sosAlerts.length > 0;

  return (
    <Layout title="Analytics & Insights">
      <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">Live Analytics</h2>
            <p className="text-white/30 text-xs mt-0.5">
              All data live from database • Last refresh: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <button onClick={load} className="btn-secondary gap-2 py-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Incidents" value={totalIncidents} loading={loading}
            color="bg-white/5 border-white/10" sub={`${activeIncidents} active, ${resolvedIncidents} resolved`} />
          <StatCard label="Total SOS Alerts" value={sosAlerts.length} loading={loading}
            color="bg-primary-500/10 border-primary-500/20" sub={`${sosPending} pending`} />
          <StatCard label="Dispatched Teams" value={sosDispatched} loading={loading}
            color="bg-teal-500/10 border-teal-500/20" sub="Currently in field" />
          <StatCard label="Resolved" value={sosResolved + resolvedIncidents} loading={loading}
            color="bg-green-500/10 border-green-500/20" sub="SOS + Incidents" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Incident Type Pie */}
          <div className="card">
            <div className="flex items-center gap-3 mb-5">
              <BarChart2 className="w-5 h-5 text-primary-400" />
              <div>
                <h3 className="text-white font-bold">Incident Type Distribution</h3>
                <p className="text-white/40 text-xs">Live from {incidents.length} incidents</p>
              </div>
            </div>
            {!hasIncidents ? (
              <div className="text-center py-16 text-white/20 text-sm">No incident data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                    dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={v => <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* SOS by Disaster Type */}
          <div className="card">
            <div className="flex items-center gap-3 mb-5">
              <Activity className="w-5 h-5 text-teal-400" />
              <div>
                <h3 className="text-white font-bold">SOS Requests by Disaster Type</h3>
                <p className="text-white/40 text-xs">Live from {sosAlerts.length} SOS alerts</p>
              </div>
            </div>
            {!hasSOS ? (
              <div className="text-center py-16 text-white/20 text-sm">No SOS data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={sosTypeData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="SOS Count" radius={[6, 6, 0, 0]}>
                    {sosTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Monthly Incident Trend */}
          <div className="card">
            <div className="flex items-center gap-3 mb-5">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <div>
                <h3 className="text-white font-bold">Monthly Incident Trend</h3>
                <p className="text-white/40 text-xs">Incidents reported per month</p>
              </div>
            </div>
            {monthlyData.length === 0 ? (
              <div className="text-center py-16 text-white/20 text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" name="Incidents" stroke="#0ea5e9" fill="url(#incGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Severity Breakdown */}
          <div className="card">
            <div className="flex items-center gap-3 mb-5">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <div>
                <h3 className="text-white font-bold">Severity Breakdown</h3>
                <p className="text-white/40 text-xs">Live from {incidents.length} incidents</p>
              </div>
            </div>
            <div className="space-y-3">
              {severityData.map(({ name, value, color }) => {
                const pct = totalIncidents > 0 ? Math.round((value / totalIncidents) * 100) : 0;
                return (
                  <div key={name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70 font-medium">{name}</span>
                      <span style={{ color }} className="font-bold">{value} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
              {!hasIncidents && <div className="text-white/20 text-sm text-center py-4">No incidents yet</div>}
            </div>

            {/* SOS Status Summary */}
            <div className="mt-6 pt-5 border-t border-white/5">
              <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">SOS Status Summary</div>
              <div className="grid grid-cols-3 gap-2">
                {sosStatusData.map(({ name, value, fill }) => (
                  <div key={name} className="bg-white/5 rounded-xl p-3 text-center">
                    <div className="text-xl font-black" style={{ color: fill }}>{value}</div>
                    <div className="text-white/30 text-xs mt-1">{name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* City-wise Table — Live from DB */}
        <div className="card">
          <div className="flex items-center gap-3 mb-5">
            <MapPin className="w-5 h-5 text-primary-400" />
            <div>
              <h3 className="text-white font-bold">City-wise Incident Analysis</h3>
              <p className="text-white/40 text-xs">Live from database — no sample data</p>
            </div>
          </div>
          {cityData.length === 0 ? (
            <div className="text-center py-12 text-white/20 text-sm">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-20" />
              No incidents logged yet. Data will appear here automatically.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['City', 'Total Incidents', 'Critical', 'Active', '% of Total'].map(h => (
                      <th key={h} className="table-header text-left px-4 py-3 text-white/40 text-xs font-semibold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cityData.map(({ city, count, critical }) => {
                    const active = incidents.filter(i => i.location?.city === city && i.status !== 'resolved').length;
                    const pct = totalIncidents > 0 ? Math.round((count / totalIncidents) * 100) : 0;
                    return (
                      <tr key={city} className="table-row border-b border-white/5 last:border-0">
                        <td className="px-4 py-3 text-white font-semibold">{city}</td>
                        <td className="px-4 py-3 text-white/70 font-bold">{count}</td>
                        <td className="px-4 py-3">
                          {critical > 0
                            ? <span className="text-red-400 font-bold">{critical} 🔴</span>
                            : <span className="text-white/30">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {active > 0
                            ? <span className="text-yellow-400 font-semibold">{active}</span>
                            : <span className="text-green-400 text-xs">✅ Clear</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-primary-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-white/50 text-sm">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}
