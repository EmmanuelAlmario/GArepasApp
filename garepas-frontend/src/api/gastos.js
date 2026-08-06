import api from './axios'

export const getGastos = () => api.get('/api/gastos')
export const getGastoById = (id) => api.get(`/api/gastos/${id}`)
export const createGasto = (data) => api.post('/api/gastos', data)
export const updateGasto = (id, data) => api.put(`/api/gastos/${id}`, data)
export const deleteGasto = (id) => api.delete(`/api/gastos/${id}`)