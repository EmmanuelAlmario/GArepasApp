import api from './axios'

export const getJornadaActiva = () => api.get('/api/jornadas/activa')
export const getHistorialJornadas = () => api.get('/api/jornadas')
export const abrirJornada = () => api.post('/api/jornadas')
export const cerrarJornada = (id) => api.post(`/api/jornadas/${id}/cerrar`)