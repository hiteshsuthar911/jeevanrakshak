import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, AlertTriangle, Users, Activity, ArrowRight,
  Zap, Radio, Map, ChevronDown, Cpu, Wifi, Clock,
  MapPin, Bell, BarChart2, Lock, Globe, Phone,
  CheckCircle, TrendingUp, UserCheck
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { statsAPI } from '../services/api';

/* ── Animated count-up ────────────────────────────────── */
function CountUp({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const steps = 60;
    const step = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <>{count.toLocaleString('en-IN')}</>;
}

/* ── Data ────────────────────────────────────────────── */
const stats = [
  { label: 'Active Incidents', value: 0,     suffix: '',  color: 'text-red-400',    icon: AlertTriangle },
  { label: 'Lives Saved',      value: 0,     suffix: '',  color: 'text-green-400',  icon: Shield },
  { label: 'Rescue Teams',     value: 0,     suffix: '',  color: 'text-blue-400',   icon: Users },
  { label: 'States Covered',   value: 0,     suffix: '',  color: 'text-orange-400', icon: Map },
];

const disasters = [];

const severityColors = { critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium' };

const usps = [
  {
    icon: Zap,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    title: 'One-Tap SOS with GPS',
    desc: 'Citizens select disaster type and fire an SOS in under 5 seconds. Live GPS coordinates are shared instantly with the nearest rescue team.',
  },
  {
    icon: Cpu,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    title: 'AI-Powered Triage',
    desc: 'Automatic severity classification routes each alert to the right team — flood, cyclone, fire, medical, landslide. No human bottleneck.',
  },
  {
    icon: Wifi,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    title: 'Real-Time Socket.io Sync',
    desc: 'Rescue GPS positions, SOS alerts, and incident status updates are pushed live across all dashboards — zero polling, zero delay.',
  },
  {
    icon: Map,
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
    title: 'Interactive Live Map',
    desc: 'Command center gets a full-India Leaflet map showing every SOS pin, rescue team location, and incident risk-zone circle in real time.',
  },
  {
    icon: UserCheck,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
    title: 'Admin Team Assignment',
    desc: 'Admins assign the ideal rescue squad to each disaster with one click — modal shows team location and live status before dispatching.',
  },
  {
    icon: BarChart2,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
    title: 'Command Analytics',
    desc: 'Response time charts, SOS heatmaps, incident type breakdowns, and resource utilisation — all in one real-time analytics dashboard.',
  },
  {
    icon: Bell,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    title: 'Priority Push Alerts',
    desc: 'Broadcast emergency messages to all citizens at once, or send targeted comms to specific rescue teams via the command comms channel.',
  },
  {
    icon: Lock,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    title: 'Role-Based JWT Auth',
    desc: 'Three isolated portals — Citizen, Rescue, and Admin — each with scoped permissions. No data leakage between roles.',
  },
];

const steps = [
  { step: '01', icon: '🆘', title: 'Citizen Sends SOS', desc: 'Selects disaster type (flood, fire, cyclone…), adds a note, and taps Send. GPS captured automatically.' },
  { step: '02', icon: '📡', title: 'Alert Reaches Admin', desc: 'SOS appears on the live command map instantly via Socket.io. Disaster type and location shown.' },
  { step: '03', icon: '🚁', title: 'Team Dispatched', desc: 'Admin picks the best-fit rescue team from options and dispatches with one click.' },
  { step: '04', icon: '📍', title: 'Live Tracking', desc: 'Rescue GPS tracked live on map. Citizen sees status update: Acknowledged → En Route → Resolved.' },
];

const techStack = [
  { name: 'React + Vite',   emoji: '⚛️' },
  { name: 'Node.js',        emoji: '🟢' },
  { name: 'MongoDB',        emoji: '🍃' },
  { name: 'Socket.io',      emoji: '⚡' },
  { name: 'Leaflet Maps',   emoji: '🗺️' },
  { name: 'JWT Auth',       emoji: '🔐' },
  { name: 'Tailwind CSS',   emoji: '🎨' },
  { name: 'Framer Motion',  emoji: '🎬' },
];

const testimonials = [];

/* ── Component ─────────────────────────────────────────── */
export default function Landing() {
  const [liveStats, setLiveStats] = useState({
    activeIncidents: 0,
    livesSaved: 0,
    rescueTeams: 0,
    statesCovered: 0
  });

  useEffect(() => {
    statsAPI.get().then(r => setLiveStats(r.data)).catch(() => {});
  }, []);

  const dynamicStats = [
    { label: 'Active Incidents', value: liveStats.activeIncidents, suffix: '',  color: 'text-red-400',    icon: AlertTriangle },
    { label: 'Lives Saved',      value: liveStats.livesSaved,      suffix: '+', color: 'text-green-400',  icon: Shield },
    { label: 'Rescue Teams',     value: liveStats.rescueTeams,     suffix: '',  color: 'text-blue-400',   icon: Users },
    { label: 'States Covered',   value: liveStats.statesCovered,   suffix: '',  color: 'text-orange-400', icon: Map },
  ];

  return (
    <div className="min-h-screen bg-dark-400 hero-pattern overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5"
        style={{ background: 'rgba(5,5,8,0.92)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center glow-sm">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-black text-xl">JeevanRakshak</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-white/50 text-sm font-medium">
          <a href="#usps" className="hover:text-white transition-colors">Features</a>
          <a href="#how" className="hover:text-white transition-colors">How it Works</a>
          <a href="#stats" className="hover:text-white transition-colors">Impact</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary text-sm py-2 px-4">Sign In</Link>
          <Link to="/login" className="btn-primary text-sm py-2 px-4">Get Started <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 px-6 min-h-[90vh] flex flex-col items-center justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.09) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)' }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="text-center max-w-5xl mx-auto relative">

          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-2 mb-8">
            <span className="status-dot status-dot-critical" />
            <span className="text-red-400 text-sm font-semibold">LIVE • Disaster Response Active Across India</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Save Lives with{' '}
            <span className="text-gradient">AI-Powered</span>
            <br />Disaster Response
          </h1>

          <p className="text-white/50 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            JeevanRakshak coordinates rescue operations, citizen SOS alerts, and resource deployment
            in real-time — connecting citizens, rescue teams, and government authorities across India.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap mb-12">
            <Link to="/login" className="btn-primary text-base px-8 py-4">
              <Zap className="w-5 h-5" /> Enter Platform
            </Link>
            <a href="#how" className="btn-secondary text-base px-8 py-4">
              <Radio className="w-5 h-5" /> How it Works
            </a>
          </div>

          {/* Hero trust badges */}
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {[
              { icon: Clock, text: '<5 sec SOS dispatch' },
              { icon: Globe, text: '28 states covered' },
              { icon: TrendingUp, text: '60% faster response' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-white/30 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                {text}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ChevronDown className="w-6 h-6 text-white/20" />
        </motion.div>
      </section>

      {/* ── Stats ──────────────────────────────────────── */}
      <section id="stats" className="py-16 px-6 border-y border-white/5" style={{ background: 'rgba(0,0,0,0.3)' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {dynamicStats.map(({ label, value, suffix, color, icon: Icon }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="card text-center">
              <Icon className={`w-8 h-8 ${color} mx-auto mb-3`} />
              <div className={`text-3xl font-black ${color}`}><CountUp target={value} />{suffix}</div>
              <div className="text-white/40 text-sm mt-1">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── USP Grid ───────────────────────────────────── */}
      <section id="usps" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="inline-flex items-center gap-2 bg-primary-600/10 border border-primary-500/20 rounded-full px-4 py-1.5 text-primary-400 text-sm font-semibold mb-4">
                <Zap className="w-3.5 h-3.5" /> What Makes Us Different
              </span>
              <h2 className="text-4xl font-black text-white mb-4">
                Built for <span className="text-gradient">India's</span> Scale
              </h2>
              <p className="text-white/40 max-w-xl mx-auto">
                Every feature is designed specifically for the speed, scale, and chaos of real disaster response.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {usps.map((u, i) => (
              <motion.div
                key={u.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`p-5 rounded-2xl border ${u.bg} flex flex-col gap-4 transition-all duration-300 cursor-default group`}
              >
                <div className={`w-11 h-11 rounded-xl border ${u.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <u.icon className={`w-5 h-5 ${u.color}`} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-2">{u.title}</h3>
                  <p className="text-white/40 text-xs leading-relaxed">{u.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ───────────────────────────────── */}
      <section id="how" className="py-20 px-6 border-t border-white/5" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl font-black text-white mb-4">How It Works</h2>
              <p className="text-white/40">From SOS tap to rescue arrival — in 4 seamless steps</p>
            </motion.div>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[calc(12.5%+1.5rem)] right-[calc(12.5%+1.5rem)] h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {steps.map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative mb-5">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600/30 to-primary-900/20 border border-primary-500/30 flex items-center justify-center text-4xl shadow-lg"
                      style={{ boxShadow: '0 0 30px rgba(220,38,38,0.15)' }}>
                      {s.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-black"
                      style={{ boxShadow: '0 0 12px rgba(220,38,38,0.5)' }}>
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="text-white font-bold text-sm mb-2">{s.title}</h3>
                  <p className="text-white/40 text-xs leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Roles Section ──────────────────────────────── */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl font-black text-white mb-4">Three Roles, One Mission</h2>
              <p className="text-white/40">Every stakeholder has a dedicated, powerful dashboard</p>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                role: 'Citizen', emoji: '🏠', border: 'border-blue-500/20',
                color: 'from-blue-500/10 to-transparent', tag: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                features: ['One-tap SOS with disaster type', 'Nearby shelter map', 'Live alert feed', 'Track your SOS status'],
              },
              {
                role: 'Rescue Team', emoji: '🚁', border: 'border-orange-500/20',
                color: 'from-orange-500/10 to-transparent', tag: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
                features: ['Live assignment map', 'Command comms channel', 'Route & resource requests', 'Real-time GPS broadcast'],
              },
              {
                role: 'Command / Admin', emoji: '🎯', border: 'border-red-500/20',
                color: 'from-red-500/10 to-transparent', tag: 'text-red-400 bg-red-500/10 border-red-500/20',
                features: ['Full India live map', 'Assign teams to SOS instantly', 'Resource allocation panel', 'Analytics & reporting'],
              },
            ].map((r, i) => (
              <motion.div key={r.role} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }} viewport={{ once: true }}
                whileHover={{ y: -4 }} className={`rounded-2xl p-6 bg-gradient-to-b ${r.color} border ${r.border} transition-all duration-300`}>
                <div className="text-5xl mb-4">{r.emoji}</div>
                <div className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold mb-3 ${r.tag}`}>{r.role}</div>
                <h3 className="text-white font-bold text-xl mb-4">{r.role}</h3>
                <ul className="space-y-2">
                  {r.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-white/50 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Incident Feed ─────────────────────────── */}
      <section className="py-16 px-6 border-t border-white/5" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <span className="status-dot status-dot-critical" />
            <h2 className="text-2xl font-bold text-white">Live Incident Feed</h2>
            <span className="badge-critical">LIVE</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {disasters.length > 0 ? disasters.map((d, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                whileHover={{ scale: 1.02 }} className="card hover:border-white/10 transition-all duration-300 group cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{d.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-bold">{d.type}</span>
                      <span className={severityColors[d.severity]}>{d.severity}</span>
                    </div>
                    <div className="text-white/50 text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{d.location}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-white/30 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />{d.time}
                      </span>
                      <span className="text-red-400 text-xs font-semibold">{d.affected} affected</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-3 text-center py-16 text-white/20 italic text-sm">
                No active disasters currently reported. Stand by for updates.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────── */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl font-black text-white mb-4">Trusted on the Ground</h2>
              <p className="text-white/40">Real voices from India's disaster response community</p>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.length > 0 ? testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }} viewport={{ once: true }}
                className="card border border-white/5 flex flex-col gap-5">
                <div className="text-3xl">{t.emoji}</div>
                <p className="text-white/70 text-sm leading-relaxed italic flex-1">"{t.quote}"</p>
                <div className="border-t border-white/5 pt-4">
                  <div className="text-white font-semibold text-sm">{t.name}</div>
                  <div className="text-white/30 text-xs mt-0.5">{t.role}</div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-3 text-center py-10 text-white/20 italic text-sm">
                JeevanRakshak is currently powering response teams across India.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Tech Stack Strip ───────────────────────────── */}
      <section className="py-12 px-6 border-t border-white/5" style={{ background: 'rgba(0,0,0,0.3)' }}>
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-white/20 text-xs uppercase tracking-widest font-semibold mb-6">Built With</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {techStack.map(t => (
              <motion.div key={t.name} whileHover={{ scale: 1.08 }}
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white/50 text-sm font-medium hover:text-white hover:border-white/20 transition-all">
                <span>{t.emoji}</span>
                <span>{t.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center border-t border-white/5 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, transparent, rgba(220,38,38,0.07))' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.1) 0%, transparent 70%)' }} />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative max-w-2xl mx-auto">
          <div className="text-6xl mb-6">🆘</div>
          <h2 className="text-5xl font-black text-white mb-4">Ready to Respond?</h2>
          <p className="text-white/40 mb-10 text-lg">
            Join India's most advanced disaster response network.<br />
            Every second saved is a life protected.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/login" className="btn-primary text-lg px-10 py-4 inline-flex">
              <Shield className="w-5 h-5" /> Access JeevanRakshak
            </Link>
            <a href="#usps" className="btn-secondary text-lg px-8 py-4 inline-flex">
              <ArrowRight className="w-5 h-5" /> Explore Features
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="py-10 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-white/60 text-sm font-semibold">JeevanRakshak</span>
          </div>
          <div className="text-white/20 text-xs">
            © 2026 JeevanRakshak — National Disaster Response Platform • India
          </div>
          <div className="flex items-center gap-4 text-white/20 text-xs">
            <span>Made with ❤️ for India</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
