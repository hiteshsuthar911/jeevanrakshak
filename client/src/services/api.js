import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jr_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jr_token');
      localStorage.removeItem('jr_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Auth ────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// ── Incidents ────────────────────────────────────────────────
export const incidentAPI = {
  getAll: () => api.get('/incidents'),
  getOne: (id) => api.get(`/incidents/${id}`),
  getAssigned: () => api.get('/incidents/rescue/assigned'),
  create: (data) => api.post('/incidents', data),
  update: (id, data) => api.patch(`/incidents/${id}`, data),
  delete: (id) => api.delete(`/incidents/${id}`),
};

// ── SOS ─────────────────────────────────────────────────────
export const sosAPI = {
  getAll:        ()         => api.get('/sos'),
  getMy:         ()         => api.get('/sos/my'),
  send:          (data)     => api.post('/sos', data),
  update:        (id, data) => api.patch(`/sos/${id}`, data),
  adminConfirm:  (id, data) => api.patch(`/sos/${id}/admin-confirm`, data),
  citizenConfirm:(id)       => api.patch(`/sos/${id}/citizen-confirm`),
  dispatch:      (id, data) => api.patch(`/sos/${id}/dispatch`, data),
};

// ── Resources ────────────────────────────────────────────────
export const resourceAPI = {
  getAll: () => api.get('/resources'),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.patch(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
};

// ── Messages ─────────────────────────────────────────────────
export const messageAPI = {
  getAll: () => api.get('/messages'),
  getUnread: () => api.get('/messages/unread'),
  send: (data) => api.post('/messages', data),
  broadcast: (data) => api.post('/messages/broadcast', data),
  markRead: (id) => api.patch(`/messages/${id}/read`),
};

// ── Weather ──────────────────────────────────────────────────
export const weatherAPI = {
  get: (city) => api.get(`/weather?city=${city}`),
};

// ── Users (admin) ────────────────────────────────────────────
export const usersAPI = {
  getByRole: (role) => api.get(`/auth/users?role=${role}`),
};
// ── Stats (public) ───────────────────────────────────────────
export const statsAPI = {
  get: () => api.get('/stats'),
};
