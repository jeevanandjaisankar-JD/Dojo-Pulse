import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Interceptor to inject JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dojo_mentor_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Auth APIs
export const loginMentor = async (username, password) => {
  const res = await api.post('/auth/login', { username, password });
  return res.data;
};

export const getMentorsRoster = async () => {
  const res = await api.get('/auth/roster');
  return res.data;
};

export const getMentorProfile = async () => {
  const res = await api.get('/auth/profile');
  return res.data;
};

// Dashboard APIs
export const getDashboardStats = async () => {
  const res = await api.get('/dashboard/stats');
  return res.data;
};

// Students APIs
export const getStudents = async (params = {}) => {
  const res = await api.get('/students', { params });
  return res.data;
};

export const getStudentById = async (id) => {
  const res = await api.get(`/students/${id}`);
  return res.data;
};

// Improvements & Analytics APIs
export const getImprovementsAnalytics = async () => {
  const res = await api.get('/analytics/improvements');
  return res.data;
};

// Upload APIs
export const uploadDojoFile = async (formData) => {
  const res = await api.post('/uploads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};

export const getUploadHistory = async () => {
  const res = await api.get('/uploads/history');
  return res.data;
};

export default api;
