import api from './axios'

export const login = (data) => api.post('/auth/login', data)

const AUTH_KEY = 'garepas_auth'

export const guardarSesion = (data) => localStorage.setItem(AUTH_KEY, JSON.stringify(data))
export const leerSesion = () => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null')
  } catch {
    return null
  }
}
export const cerrarSesion = () => localStorage.removeItem(AUTH_KEY)