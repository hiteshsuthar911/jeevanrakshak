import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jr_token');
    const stored = localStorage.getItem('jr_user');
    if (token && stored) {
      try {
        const u = JSON.parse(stored);
        setUser(u);
        connectSocket(u.id, u.role);
      } catch { logout(); }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('jr_token', data.token);
    localStorage.setItem('jr_user', JSON.stringify(data.user));
    setUser(data.user);
    connectSocket(data.user.id, data.user.role);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    localStorage.setItem('jr_token', data.token);
    localStorage.setItem('jr_user', JSON.stringify(data.user));
    setUser(data.user);
    connectSocket(data.user.id, data.user.role);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('jr_token');
    localStorage.removeItem('jr_user');
    disconnectSocket();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) return { user: null, loading: true, login: async () => {}, register: async () => {}, logout: () => {} };
  return ctx;
};
