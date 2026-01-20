import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptor to add token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (email, password, name) => api.post('/auth/register', { email, password, name }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  getProfile: (userId) => api.get(`/auth/profile?userId=${userId}`),
};

export const jobsAPI = {
  getFeed: (userId, filters = {}) => 
    api.get('/jobs/feed', { params: { userId, ...filters } }),
  getJob: (jobId) => api.get(`/jobs/${jobId}`),
  searchJobs: (userId, query) => api.get('/jobs/search/query', { params: { userId, query } }),
};

export const applicationsAPI = {
  recordApplication: (userId, jobId, status = 'applied') =>
    api.post('/applications', { userId, jobId, status }),
  getApplications: (userId, status = null) =>
    api.get('/applications', { params: { userId, status } }),
  updateStatus: (applicationId, status) =>
    api.patch(`/applications/${applicationId}`, { status }),
  deleteApplication: (applicationId) =>
    api.delete(`/applications/${applicationId}`),
};

export const resumeAPI = {
  upload: (userId, resumeText, fileName) =>
    api.post('/resume/upload', { userId, resumeText, fileName }),
  get: (userId) => api.get('/resume', { params: { userId } }),
  update: (userId, resumeText, fileName) =>
    api.put('/resume', { userId, resumeText, fileName }),
  delete: (userId) => api.delete('/resume', { data: { userId } }),
};

export const chatAPI = {
  sendMessage: (userId, message) =>
    api.post('/chat/message', { userId, message }),
  getHistory: (userId) => api.get('/chat/history', { params: { userId } }),
  clearHistory: (userId) => api.delete('/chat/history', { data: { userId } }),
};

export default api;
