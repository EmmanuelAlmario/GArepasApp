import api from './axios'

export const getProductos = () => api.get('/api/productos')
export const getProductoById = (id) => api.get(`/api/productos/${id}`)
export const createProducto = (data) => api.post('/api/productos', data)
export const updateProducto = (id, data) => api.put(`/api/productos/${id}`, data)
export const ajustarStockProducto = (id, delta, motivo = '') =>
  api.patch(`/api/productos/${id}/ajustar-stock`, null, { params: { delta, motivo } })
export const deleteProducto = (id) => api.delete(`/api/productos/${id}`)
