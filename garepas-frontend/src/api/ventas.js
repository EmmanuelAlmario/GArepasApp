import api from './axios'

export const getVentas = () => api.get('/api/ventas')
export const getVentaById = (id) => api.get(`/api/ventas/${id}`)
export const createVenta = (data) => api.post('/api/ventas', data)
export const deleteVenta = (id) => api.delete(`/api/ventas/${id}`)