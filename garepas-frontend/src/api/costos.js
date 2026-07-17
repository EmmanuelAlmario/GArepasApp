import api from './axios'

export const getCostoReceta = (id) => api.get(`/recetas/${id}/costo`)
export const getCostoProducto = (id) => api.get(`/productos/${id}/costo`)
export const getSugerenciaPrecio = (id, margen = 0.4) =>
  api.post(`/productos/${id}/sugerir-precio`, null, { params: { margen } })
