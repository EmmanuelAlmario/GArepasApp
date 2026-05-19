import api from './axios'

export const getProducciones = () => api.get('/producciones')
export const getProduccionById = (id) => api.get(`/producciones/${id}`)
export const createProduccion = (data) => api.post('/producciones', data)
export const deleteProduccion = (id) => api.delete(`/producciones/${id}`)