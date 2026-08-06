import api from './axios'

export const getRecetas = () => api.get('/api/recetas')
export const getRecetaById = (id) => api.get(`/api/recetas/${id}`)
export const createReceta = (data) => api.post('/api/recetas', data)
export const updateReceta = (id, data) => api.put(`/api/recetas/${id}`, data)
export const deleteReceta = (id) => api.delete(`/api/recetas/${id}`)