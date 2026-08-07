import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import api from './axios'

describe('axios client', () => {
  it('normaliza la baseURL quitando el sufijo /api de VITE_API_URL', () => {
    expect(api.defaults.baseURL).toBe('http://backend.test')
  })
})

describe('interceptor de respuesta 401', () => {
  let logoutSpy
  beforeEach(() => {
    logoutSpy = vi.fn()
    window.addEventListener('garepas:logout', logoutSpy)
  })
  afterEach(() => {
    window.removeEventListener('garepas:logout', logoutSpy)
    try { localStorage.clear() } catch { /* noop */ }
  })

  it('un 401 fuera del login limpia sesión y notifica', async () => {
    localStorage.setItem('garepas_auth', JSON.stringify({ token: 'abc' }))
    const err = { response: { status: 401 }, config: { url: '/api/usuarios' } }
    await expect(api.interceptors.response.handlers[0].rejected(err)).rejects.toBe(err)
    expect(localStorage.getItem('garepas_auth')).toBeNull()
    expect(logoutSpy).toHaveBeenCalledTimes(1)
  })

  it('un 401 del login NO cierra sesión ni limpia', async () => {
    localStorage.setItem('garepas_auth', JSON.stringify({ token: 'abc' }))
    const err = { response: { status: 401 }, config: { url: '/api/auth/login' } }
    await expect(api.interceptors.response.handlers[0].rejected(err)).rejects.toBe(err)
    expect(localStorage.getItem('garepas_auth')).not.toBeNull()
    expect(logoutSpy).not.toHaveBeenCalled()
  })
})

describe('interceptor de request', () => {
  afterEach(() => {
    try { localStorage.clear() } catch { /* noop */ }
  })

  it('agrega Authorization cuando hay token guardado', () => {
    localStorage.setItem('garepas_auth', JSON.stringify({ token: 'mi-token' }))
    const config = api.interceptors.request.handlers[0].fulfilled({ headers: {} })
    expect(config.headers.Authorization).toBe('Bearer mi-token')
  })

  it('no agrega header cuando no hay token', () => {
    const config = api.interceptors.request.handlers[0].fulfilled({ headers: {} })
    expect(config.headers.Authorization).toBeUndefined()
  })

  it('ignora una sesión corrupta en localStorage', () => {
    localStorage.setItem('garepas_auth', '{json roto')
    const config = api.interceptors.request.handlers[0].fulfilled({ headers: {} })
    expect(config.headers.Authorization).toBeUndefined()
  })
})