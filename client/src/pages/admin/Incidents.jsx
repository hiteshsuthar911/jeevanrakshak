import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/common/Layout';
import { incidentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Search, Trash2, Edit, X, ChevronDown } from 'lucide-react';

const incidentTypes = ['flood', 'cyclone', 'landslide', 'fire', 'waterlogging', 'earthquake', 'other'];
const severities = ['low', 'medium', 'high', 'critical'];

function Modal({ onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || {
    title: '', type: 'flood', severity: 'medium', description: '',
    location: { lat: '', lng: '', city: '', address: '' }, affectedPeople: 0
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg card border border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-bold text-lg">{initial ? 'Update Incident' : 'Create New Incident'}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-white/50 hover:text-white" /></button>
        </div>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
          <div>
            <label className="label">Title *</label>
            <input className="input" placeholder="Incident title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                {incidentTypes.map(t => <option key={t} className="bg-surface-100 capitalize">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Severity</label>
              <select className="input" value={form.severity} onChange={e => setForm({...form, severity: e.target.value})}>
                {severities.map(s => <option key={s} className="bg-surface-100 capitalize">{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">City *</label>
            <input className="input" placeholder="e.g. Mumbai" value={form.location.city}
              onChange={e => setForm({...form, location: {...form.location, city: e.target.value}})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Latitude</label>
              <input className="input" type="number" placeholder="19.076" value={form.location.lat}
                onChange={e => setForm({...form, location: {...form.location, lat: e.target.value}})} />
            </div>
            <div>
              <label className="label">Longitude</label>
              <input className="input" type="number" placeholder="72.877" value={form.location.lng}
                onChange={e => setForm({...form, location: {...form.location, lng: e.target.value}})} />
            </div>
          </div>
          <div>
            <label className="label">Affected People</label>
            <input className="input" type="number" value={form.affectedPeople}
              onChange={e => setForm({...form, affectedPeople: parseInt(e.target.value) || 0})} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} value={form.description}
              onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe the situation..." />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={() => onSave(form)} className="btn-primary flex-1 justify-center">
            {initial ? 'Update Incident' : 'Create Incident'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editIncident, setEditIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('date');

  const fetchIncidents = () => {
    setLoading(true);
    incidentAPI.getAll().then(r => setIncidents(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchIncidents(); }, []);

  const handleCreate = async (form) => {
    try {
      await incidentAPI.create(form);
      toast.success('✅ Incident created');
      setShowModal(false);
      fetchIncidents();
    } catch (e) { toast.error(e.response?.data?.message || 'Create failed'); }
  };

  const handleUpdate = async (form) => {
    try {
      await incidentAPI.update(editIncident._id, form);
      toast.success('✅ Incident updated');
      setEditIncident(null);
      fetchIncidents();
    } catch { toast.error('Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this incident?')) return;
    try {
      await incidentAPI.delete(id);
      toast.success('Incident deleted');
      fetchIncidents();
    } catch { toast.error('Delete failed'); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await incidentAPI.update(id, { status });
      setIncidents(prev => prev.map(i => i._id === id ? { ...i, status } : i));
      toast.success(`Status → ${status}`);
    } catch { toast.error('Failed'); }
  };

  const filtered = incidents
    .filter(i => i.title?.toLowerCase().includes(search.toLowerCase()) || i.location?.city?.toLowerCase().includes(search.toLowerCase()))
    .filter(i => filterSeverity === 'all' || i.severity === filterSeverity)
    .filter(i => filterStatus === 'all' || i.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'severity') { const o = ['critical','high','medium','low']; return o.indexOf(a.severity) - o.indexOf(b.severity); }
      return 0;
    });

  const typeEmoji = { flood: '🌊', cyclone: '🌀', landslide: '⛰️', fire: '🔥', waterlogging: '💧', earthquake: '🌍', other: '⚠️' };

  return (
    <Layout title="Incident Management">
      <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input className="input pl-10 py-2.5" placeholder="Search incidents..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input py-2.5 w-36" value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}>
            <option value="all" className="bg-surface-100">All Severity</option>
            {severities.map(s => <option key={s} value={s} className="bg-surface-100 capitalize">{s}</option>)}
          </select>
          <select className="input py-2.5 w-36" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            {['all','open','active','resolved','closed'].map(s => <option key={s} value={s} className="bg-surface-100 capitalize">{s}</option>)}
          </select>
          <button onClick={() => setShowModal(true)} className="btn-primary flex-shrink-0">
            <Plus className="w-4 h-4" /> New Incident
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: incidents.length, color: 'text-white' },
            { label: 'Active', value: incidents.filter(i => i.status === 'active').length, color: 'text-blue-400' },
            { label: 'Critical', value: incidents.filter(i => i.severity === 'critical').length, color: 'text-red-400' },
            { label: 'Resolved', value: incidents.filter(i => i.status === 'resolved').length, color: 'text-green-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white/5 border border-white/5 rounded-xl p-4 text-center">
              <div className={`text-2xl font-black ${color}`}>{loading ? '—' : value}</div>
              <div className="text-white/40 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Type / Title', 'Location', 'Severity', 'Status', 'Affected', 'Assigned To', 'Date', 'Actions'].map(h => (
                    <th key={h} className="table-header text-left px-5 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}><td colSpan={8} className="px-5 py-3"><div className="skeleton h-8 rounded" /></td></tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-white/30">No incidents found</td></tr>
                ) : filtered.map(inc => (
                  <tr key={inc._id} className="table-row">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{typeEmoji[inc.type] || '⚠️'}</span>
                        <div>
                          <div className="text-white text-sm font-semibold line-clamp-1">{inc.title}</div>
                          <div className="text-white/30 text-xs capitalize">{inc.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white/50 text-sm">{inc.location?.city || '—'}</td>
                    <td className="px-5 py-4"><span className={`badge-${inc.severity}`}>{inc.severity}</span></td>
                    <td className="px-5 py-4">
                      <select
                        className="bg-transparent text-xs border border-white/10 rounded-lg px-2 py-1 text-white"
                        value={inc.status}
                        onChange={e => handleStatusChange(inc._id, e.target.value)}
                      >
                        {['open','active','resolved','closed'].map(s => <option key={s} value={s} className="bg-surface-100">{s}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-white/50 text-sm">{(inc.affectedPeople || 0).toLocaleString()}</td>
                    <td className="px-5 py-4 text-white/50 text-sm">{inc.assignedTeam?.teamName || inc.assignedTeam?.name || '—'}</td>
                    <td className="px-5 py-4 text-white/30 text-xs">{new Date(inc.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditIncident(inc)} className="text-white/40 hover:text-blue-400 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(inc._id)} className="text-white/40 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && <Modal onClose={() => setShowModal(false)} onSave={handleCreate} />}
        {editIncident && <Modal onClose={() => setEditIncident(null)} onSave={handleUpdate} initial={editIncident} />}
      </div>
    </Layout>
  );
}
