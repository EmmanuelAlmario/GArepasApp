import api from './axios'

export const getCostoReceta = (id) => api.get(`/api/recetas/${id}/costo`)
export const getCostoProducto = (id) => api.get(`/api/productos/${id}/costo`)
export const sugerirPrecio = (id, margen) =>
  api.post(`/api/productos/${id}/sugerir-precio`, null, { params: { margen } })
export const getSugerenciaPrecio = (id, margen) =>
  api.post(`/api/productos/${id}/sugerir-precio`, null, { params: { margen } })
