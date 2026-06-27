import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('devtrack_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('devtrack_token')
      localStorage.removeItem('devtrack_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  googleLogin: (data) => api.post('/auth/google', data),
  githubLogin: (data) => api.post('/auth/github', data),
}

// Projects
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  create: (data) => api.post('/projects', data),
  delete: (id) => api.delete(`/projects/${id}`),
  invite: (id, email) => api.post(`/projects/${id}/invite`, { email }),
  acceptInvite: (token) => api.post('/projects/accept-invite', { token }),
  removeMember: (projectId, userId) => api.delete(`/projects/${projectId}/members/${userId}`),
}

// Tasks
export const tasksAPI = {
  getByProject: (projectId) => api.get(`/projects/${projectId}/tasks`),
  create: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  updateStatus: (id, status) => api.put(`/tasks/${id}/status`, { status }),
  delete: (id) => api.delete(`/tasks/${id}`),
  addComment: (id, text) => api.post(`/tasks/${id}/comments`, { text }),
}

// Notifications
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
}

// Users
export const usersAPI = {
  search: (q) => api.get(`/users/search?q=${q}`),
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
}

// AI
export const aiAPI = {
  suggestTasks: (projectName, projectDescription) =>
    api.post('/ai/suggest-tasks', { projectName, projectDescription }),
  improveDescription: (title, description) =>
    api.post('/ai/improve-description', { title, description }),
  planSprint: (projectId, deadline) =>
    api.post('/ai/plan-sprint', { projectId, deadline }),
}

export default api