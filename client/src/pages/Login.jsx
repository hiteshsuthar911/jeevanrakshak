import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Activity, Eye, EyeOff, AlertCircle, Users, Siren, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const roles = [
  { id: 'citizen', label: 'Citizen',      icon: Users,  desc: 'Submit rescue requests & track status',    color: 'text-primary-400 border-primary-500/40 bg-primary-500/10' },
  { id: 'rescue',  label: 'Rescue Team',  icon: Siren,  desc: 'View missions & broadcast location',        color: 'text-teal-400 border-teal-500/40 bg-teal-500/10' },
  { id: 'admin',   label: 'Admin',        icon: Shield, desc: 'Review requests, confirm & dispatch teams', color: 'text-blue-300 border-blue-500/40 bg-blue-500/10' },
];

const demoCredentials = {
  citizen: { email: 'citizen@jr.in', password: 'Pass@1234' },
  rescue: { email: 'rescue@jr.in', password: 'Rescue@1234' },
  admin: { email: 'admin@jeevanrakshak.in', password: 'Admin@1234' },
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('citizen');
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDemo = () => {
    const creds = demoCredentials[selectedRole];
    setForm(creds);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill all fields'); return; }
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'rescue') navigate('/rescue');
      else navigate('/citizen');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-400 hero-pattern flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center glow-blue">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-black text-2xl">JeevanRakshak</span>
          </Link>
          <p className="text-white/40 text-sm">AI-Powered Disaster Response Platform</p>
        </div>

        <div className="card-glass border border-white/10 rounded-2xl p-8">
          <h2 className="text-white font-bold text-xl mb-6 text-center">Select Your Role</h2>

          {/* Role Selector */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {roles.map(({ id, label, icon: Icon, desc, color }) => (
              <button
                key={id}
                onClick={() => { setSelectedRole(id); setError(''); }}
                className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                  selectedRole === id ? color : 'border-white/10 bg-white/5 text-white/40'
                }`}
              >
                <Icon className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xs font-semibold">{label}</div>
              </button>
            ))}
          </div>

          {/* Role description */}
          <AnimatePresence mode="wait">
            <motion.p
              key={selectedRole}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-white/40 text-sm text-center mb-6"
            >
              {roles.find(r => r.id === selectedRole)?.desc}
            </motion.p>
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-xl p-3"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In to {roles.find(r => r.id === selectedRole)?.label}</>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <button
              onClick={handleDemo}
              className="w-full text-center text-white/40 hover:text-white/70 text-xs transition-colors py-2"
            >
              🔑 Click to fill demo credentials for {selectedRole}
            </button>
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          JeevanRakshak © 2026 • National Disaster Response System
        </p>
      </motion.div>
    </div>
  );
}
