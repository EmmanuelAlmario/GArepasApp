import api from './axios'

export const getProducciones = () => api.get('/api/producciones')
export const getProduccionById = (id) => api.get(`/api/producciones/${id}`)
export const createProduccion = (data) => api.post('/api/producciones', data)
export const deleteProduccion = (id) => api.delete(`/api/producciones/${id}`)
export const verificarProduccion = (id) => api.patch(`/api/producciones/${id}/verificar`)