import api from './axios'

export const getEmpleados = () => api.get('/empleados')
export const getEmpleadoById = (id) => api.get(`/empleados/${id}`)
export const createEmpleado = (data) => api.post('/empleados', data)
export const updateEmpleado = (id, data) => api.put(`/empleados/${id}`, data)
export const agregarDias = (id, dias) => api.patch(`/empleados/${id}/agregar-dias`, null, { params: { dias } })
export const quitarDias = (id, dias) => api.patch(`/empleados/${id}/quitar-dias`, null, { params: { dias } })
export const registrarPago = (data) => api.post('/empleados/pago', data)
export const getHistorial = (id) => api.get(`/empleados/${id}/historial`)