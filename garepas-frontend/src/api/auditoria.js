import api from './axios'

export const getAuditoria = (limite = 100) => api.get('/api/auditoria', { params: { limite } })
export const getAuditoriaUsuario = (username, limite = 100) =>
  api.get(`/api/auditoria/usuario/${username}`, { params: { limite } })