import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:4000/api'),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('learnsphere_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error.response?.data || { message: 'Network error' }),
);

export const authApi = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
  me: () => api.get('/auth/me'),
};

export const courseApi = {
  list: () => api.get('/courses'),
  detail: (id) => api.get(`/courses/${id}`),
  create: (payload) => api.post('/courses', payload),
  update: (id, payload) => api.put(`/courses/${id}`, payload),
  remove: (id) => api.delete(`/courses/${id}`),
};

export const enrollmentApi = {
  enroll: (payload) => api.post('/enrollments', payload),
  userEnrollments: (userId) => api.get(`/enrollments/user/${userId}`),
  updateProgress: (id, payload) => api.put(`/enrollments/${id}/progress`, payload),
};

export const assessmentApi = {
  list: (courseId) => api.get(`/assessments/${courseId}`),
  questions: (id) => api.get(`/assessments/${id}/questions`),
  submit: (id, payload) => api.post(`/assessments/${id}/submit`, payload),
  attempts: (userId) => api.get(`/assessments/attempts/user/${userId}`),
};

export const certificateApi = {
  generate: (payload) => api.post('/certificates/generate', payload),
  list: (userId) => api.get(`/certificates/user/${userId}`),
  verify: (id) => api.get(`/certificates/verify/${id}`),
};

export const progressApi = {
  complete: (payload) => api.post('/progress/complete', payload),
  getProgress: (userId, courseId) => api.get(`/progress/user/${userId}/course/${courseId}`),
};

export const adminApi = {
  stats: () => api.get('/admin/stats'),
  students: () => api.get('/admin/students'),
  reports: () => api.get('/admin/reports'),
  table: (tableName) => api.get(`/admin/database/${tableName}`),
};

export const notesApi = {
  get: (lessonId) => api.get(`/notes/${lessonId}`),
  save: (lessonId, content) => api.post(`/notes/${lessonId}`, { content }),
};

export default api;
