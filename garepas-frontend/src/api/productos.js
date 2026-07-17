import api from './axios'

export const getProductos = () => api.get('/productos')
export const getProductoById = (id) => api.get(`/productos/${id}`)
export const createProducto = (data) => api.post('/productos', data)
export const updateProducto = (id, data) => api.put(`/productos/${id}`, data)
export const ajustarStockProducto = (id, delta, motivo = '') =>
  api.patch(`/productos/${id}/ajustar-stock`, null, { params: { delta, motivo } })
export const deleteProducto = (id) => api.delete(`/productos/${id}`)
