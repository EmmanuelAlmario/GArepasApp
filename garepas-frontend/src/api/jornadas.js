import api from './axios'

export const getJornadaActiva = () => api.get('/jornadas/activa')
export const getHistorialJornadas = () => api.get('/jornadas')
export const abrirJornada = () => api.post('/jornadas')
export const cerrarJornada = (id) => api.post(`/jornadas/${id}/cerrar`)