import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/common/Layout';
import { resourceAPI, incidentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Package, Plus, X, CheckCircle, AlertCircle, MapPin } from 'lucide-react';

const resourceEmojis = { boat: '🚤', ambulance: '🚑', helicopter: '🚁', food: '🍱', medicine: '💊', shelter: '🏕️', vehicle: '🚛', 'rescue-kit': '🎒' };
const resourceTypes  = ['boat', 'ambulance', 'helicopter', 'food', 'medicine', 'shelter', 'vehicle', 'rescue-kit'];
const statusColors   = { available: 'text-green-400 bg-green-500/10 border-green-500/20', deployed: 'text-blue-400 bg-blue-500/10 border-blue-500/20', maintenance: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' };

/* ── Add Resource Modal ─────────────────────────────────── */
function AddResourceModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', type: 'ambulance', quantity: 1, city: '', status: 'available' });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!form.name.trim() || !form.city.trim()) { toast.error('Name and city are required'); return; }
    setSaving(true);
    try { await onAdd(form); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md card border border-teal-500/20"
        style={{ background: 'linear-gradient(135deg, #0a1628 0%, #04080f 100%)' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600/30 rounded-xl flex items-center justify-center">
              <span className="text-lg">{resourceEmojis[form.type] || '📦'}</span>
            </div>
            <div><div className="text-white font-bold">Add New Resource</div><div className="text-white/40 text-xs">Add to resource pool</div></div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-white/50 hover:text-white" /></button>
        </div>

        <div className="space-y-3 mb-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Resource Type</label>
              <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {resourceTypes.map(t => (
                  <option key={t} value={t} className="bg-surface-100 capitalize">{resourceEmojis[t]} {t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="available" className="bg-surface-100">✅ Available</option>
                <option value="maintenance" className="bg-surface-100">🔧 Maintenance</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Resource Name</label>
            <input className="input" placeholder="e.g. NDRF Ambulance Unit 3" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Quantity</label>
              <input type="number" min={1} className="input" value={form.quantity}
                onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">City / Location</label>
              <input className="input" placeholder="e.g. Mumbai" value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center py-3">Cancel</button>
          <button onClick={handleAdd} disabled={saving} className="btn-teal flex-1 justify-center py-3 disabled:opacity-40">
            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Plus className="w-4 h-4" /> Add Resource</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function AssignModal({ resource, incidents, onClose, onAssign }) {
  const [selectedIncident, setSelectedIncident] = useState('');
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md card border border-white/10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold">Assign Resource</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-white/50 hover:text-white" /></button>
        </div>
        <div className="mb-4 p-3 bg-white/5 rounded-xl">
          <div className="text-2xl mb-1">{resourceEmojis[resource.type] || '📦'}</div>
          <div className="text-white font-semibold">{resource.name}</div>
          <div className="text-white/40 text-sm capitalize">{resource.type} • {resource.location?.city}</div>
        </div>
        <div>
          <label className="label">Assign to Incident</label>
          <select className="input" value={selectedIncident} onChange={e => setSelectedIncident(e.target.value)}>
            <option value="" className="bg-surface-100">Select incident...</option>
            {incidents.filter(i => i.status !== 'resolved').map(i => (
              <option key={i._id} value={i._id} className="bg-surface-100">{i.title} — {i.location?.city}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button
            onClick={() => onAssign(resource._id, selectedIncident)}
            disabled={!selectedIncident}
            className="btn-primary flex-1 justify-center disabled:opacity-40"
          >
            Assign Resource
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Resources() {
  const [resources, setResources]     = useState([]);
  const [incidents, setIncidents]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [assignTarget, setAssignTarget] = useState(null);
  const [showAdd, setShowAdd]         = useState(false);
  const [filterType, setFilterType]   = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchAll = () => {
    setLoading(true);
    Promise.all([resourceAPI.getAll(), incidentAPI.getAll()])
      .then(([r, i]) => { setResources(r.data); setIncidents(i.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAssign = async (resourceId, incidentId) => {
    try {
      await resourceAPI.update(resourceId, { assignedTo: incidentId, status: 'deployed' });
      toast.success('✅ Resource assigned successfully');
      setAssignTarget(null);
      fetchAll();
    } catch { toast.error('Assignment failed'); }
  };

  const handleToggleStatus = async (resource) => {
    const newStatus = resource.status === 'available' ? 'deployed' : 'available';
    try {
      await resourceAPI.update(resource._id, { status: newStatus, assignedTo: newStatus === 'available' ? null : resource.assignedTo });
      toast.success(`Status → ${newStatus}`);
      fetchAll();
    } catch { toast.error('Update failed'); }
  };

  const handleAdd = async (form) => {
    try {
      await resourceAPI.create({
        name: form.name, type: form.type,
        quantity: form.quantity, status: form.status,
        location: { city: form.city },
      });
      toast.success('✅ Resource added successfully');
      setShowAdd(false);
      fetchAll();
    } catch { toast.error('Failed to add resource'); }
  };

  const types = ['all', 'boat', 'ambulance', 'helicopter', 'food', 'medicine', 'shelter', 'vehicle', 'rescue-kit'];
  const filtered = resources
    .filter(r => filterType === 'all' || r.type === filterType)
    .filter(r => filterStatus === 'all' || r.status === filterStatus);

  const stats = {
    total: resources.length,
    available: resources.filter(r => r.status === 'available').length,
    deployed: resources.filter(r => r.status === 'deployed').length,
  };

  return (
    <Layout title="Resource Allocation">
      <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
          <div>
            <h2 className="text-white font-bold text-lg">Resource Allocation</h2>
            <p className="text-white/30 text-xs">Manage available rescue resources</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-teal gap-2">
            <Plus className="w-4 h-4" /> Add Resource
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Resources', value: stats.total, color: 'text-white', bg: 'bg-white/5' },
            { label: 'Available', value: stats.available, color: 'text-green-400', bg: 'bg-green-500/5 border border-green-500/20' },
            { label: 'Deployed', value: stats.deployed, color: 'text-blue-400', bg: 'bg-blue-500/5 border border-blue-500/20' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-2xl p-5 text-center ${bg}`}>
              <div className={`text-3xl font-black ${color}`}>{loading ? '—' : value}</div>
              <div className="text-white/40 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <select className="input py-2.5 w-40" value={filterType} onChange={e => setFilterType(e.target.value)}>
            {types.map(t => <option key={t} value={t} className="bg-surface-100 capitalize">{t === 'all' ? 'All Types' : t}</option>)}
          </select>
          <select className="input py-2.5 w-40" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            {['all','available','deployed','maintenance'].map(s => <option key={s} value={s} className="bg-surface-100 capitalize">{s === 'all' ? 'All Status' : s}</option>)}
          </select>
        </div>

        {/* Resource Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(resource => (
              <motion.div
                key={resource._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card hover:border-white/10 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{resourceEmojis[resource.type] || '📦'}</span>
                    <div>
                      <div className="text-white font-bold text-sm">{resource.name}</div>
                      <div className="text-white/40 text-xs capitalize">{resource.type}</div>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full border capitalize ${statusColors[resource.status]}`}>
                    {resource.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Location</span>
                    <span className="text-white/70">{resource.location?.city || '—'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Quantity</span>
                    <span className="text-white/70">{resource.quantity}</span>
                  </div>
                  {resource.assignedTo && (
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40">Incident</span>
                      <span className="text-blue-400 truncate ml-4">{resource.assignedTo?.title || 'Assigned'}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setAssignTarget(resource)}
                    disabled={resource.status === 'deployed'}
                    className="btn-secondary flex-1 justify-center text-xs py-2 disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" /> Assign
                  </button>
                  <button
                    onClick={() => handleToggleStatus(resource)}
                    className={`flex-1 justify-center text-xs py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-all ${
                      resource.status === 'available'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                        : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                    }`}
                  >
                    {resource.status === 'available' ? <><AlertCircle className="w-3.5 h-3.5" /> Deploy</> : <><CheckCircle className="w-3.5 h-3.5" /> Return</>}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {assignTarget && (
          <AssignModal resource={assignTarget} incidents={incidents}
            onClose={() => setAssignTarget(null)} onAssign={handleAssign} />
        )}
        {showAdd && (
          <AddResourceModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />
        )}
      </div>
    </Layout>
  );
}
