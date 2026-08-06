import api from './axios'

export const getInsumos = () => api.get('/api/insumos')
export const getInsumoById = (id) => api.get(`/api/insumos/${id}`)
export const createInsumo = (data) => api.post('/api/insumos', data)
export const updateInsumo = (id, data) => api.put(`/api/insumos/${id}`, data)
export const deleteInsumo = (id) => api.delete(`/api/insumos/${id}`)
export const ajustarStock = (data) => api.post('/api/insumos/ajustar-stock', data)