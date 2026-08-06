import api from './axios'

export const getEmpleados = () => api.get('/api/empleados')
export const getEmpleadoById = (id) => api.get(`/api/empleados/${id}`)
export const createEmpleado = (data) => api.post('/api/empleados', data)
export const updateEmpleado = (id, data) => api.put(`/api/empleados/${id}`, data)
export const agregarDias = (id, dias) => api.patch(`/api/empleados/${id}/agregar-dias`, null, { params: { dias } })
export const quitarDias = (id, dias) => api.patch(`/api/empleados/${id}/quitar-dias`, null, { params: { dias } })
export const registrarPago = (data) => api.post('/api/empleados/pago', data)
export const getHistorial = (id) => api.get(`/api/empleados/${id}/historial`)