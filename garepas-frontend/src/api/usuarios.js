import api from './axios'

export const getUsuarios = () => api.get('/api/usuarios')
export const createUsuario = (data) => api.post('/api/usuarios', data)
export const updateUsuario = (id, data) => api.put(`/api/usuarios/${id}`, data)
export const deleteUsuario = (id) => api.delete(`/api/usuarios/${id}`)