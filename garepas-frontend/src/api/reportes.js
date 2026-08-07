import api from './axios'

export const getReporteResumen = (desde, hasta) =>
  api.get('/api/reportes/resumen', { params: { desde, hasta } })