import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Citizen from './pages/Citizen';
import Rescue from './pages/Rescue';
import Admin from './pages/Admin';
import AdminMap from './pages/admin/AdminMap';
import Incidents from './pages/admin/Incidents';
import Resources from './pages/admin/Resources';
import Analytics from './pages/admin/Analytics';

// Guard components
const RequireAuth = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-dark-400 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <div className="text-white/40 text-sm">Loading JeevanRakshak...</div>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />;
  return children;
};

const PublicOnly = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={`/${user.role}`} replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />

      {/* Citizen */}
      <Route path="/citizen" element={<RequireAuth roles={['citizen']}><Citizen /></RequireAuth>} />
      <Route path="/citizen/requests" element={<RequireAuth roles={['citizen']}><Citizen /></RequireAuth>} />
      <Route path="/citizen/alerts" element={<RequireAuth roles={['citizen']}><Citizen /></RequireAuth>} />

      {/* Rescue */}
      <Route path="/rescue" element={<RequireAuth roles={['rescue']}><Rescue /></RequireAuth>} />
      <Route path="/rescue/map" element={<RequireAuth roles={['rescue']}><Rescue /></RequireAuth>} />
      <Route path="/rescue/messages" element={<RequireAuth roles={['rescue']}><Rescue /></RequireAuth>} />

      {/* Admin */}
      <Route path="/admin" element={<RequireAuth roles={['admin']}><Admin /></RequireAuth>} />
      <Route path="/admin/requests" element={<RequireAuth roles={['admin']}><Admin /></RequireAuth>} />
      <Route path="/admin/dispatch" element={<RequireAuth roles={['admin']}><Admin /></RequireAuth>} />
      <Route path="/admin/map" element={<RequireAuth roles={['admin']}><AdminMap /></RequireAuth>} />
      <Route path="/admin/incidents" element={<RequireAuth roles={['admin']}><Incidents /></RequireAuth>} />
      <Route path="/admin/resources" element={<RequireAuth roles={['admin']}><Resources /></RequireAuth>} />
      <Route path="/admin/analytics" element={<RequireAuth roles={['admin']}><Analytics /></RequireAuth>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a1a2e',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              duration: 4000,
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
