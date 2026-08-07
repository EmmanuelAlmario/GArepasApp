import api from './axios'

export const getAuditoria = (limite = 100) => api.get('/api/auditoria', { params: { limite } })
export const getAuditoriaUsuario = (username, limite = 100) =>
  api.get(`/api/auditoria/usuario/${username}`, { params: { limite } })
export const getAuditoriaPaginado = (page, size) =>
  api.get('/api/auditoria/paginado', { params: { page, size } })
export const getAuditoriaUsuarioPaginado = (username, page, size) =>
  api.get(`/api/auditoria/usuario/${username}/paginado`, { params: { page, size } })