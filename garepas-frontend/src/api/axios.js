import axios from 'axios'

// Normaliza el host para que no se duplique el prefijo "/api":
// si VITE_API_URL ya trae "/api" (p.ej. ".../api"), se recorta para
// que las rutas del frontend ("/api/usuarios", etc.) queden únicas.
const rawBase = import.meta.env.VITE_API_URL ?? 'https://garepasapp-production.up.railway.app'
const baseURL = rawBase.replace(/\/api\/?$/, '')

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('garepas_auth')
  if (raw) {
    try {
      const { token } = JSON.parse(raw)
      if (token) config.headers.Authorization = `Bearer ${token}`
    } catch {
      /* sesión corrupta */
    }
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && err.config?.url !== '/api/auth/login') {
      localStorage.removeItem('garepas_auth')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  },
)

export default api