import api from './axios'

export const getGastos = () => api.get('/gastos')
export const getGastoById = (id) => api.get(`/gastos/${id}`)
export const createGasto = (data) => api.post('/gastos', data)
export const updateGasto = (id, data) => api.put(`/gastos/${id}`, data)
export const deleteGasto = (id) => api.delete(`/gastos/${id}`)