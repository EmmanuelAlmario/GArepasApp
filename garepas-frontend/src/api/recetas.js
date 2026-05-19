import api from './axios'

export const getRecetas = () => api.get('/recetas')
export const getRecetaById = (id) => api.get(`/recetas/${id}`)
export const createReceta = (data) => api.post('/recetas', data)
export const updateReceta = (id, data) => api.put(`/recetas/${id}`, data)
export const deleteReceta = (id) => api.delete(`/recetas/${id}`)