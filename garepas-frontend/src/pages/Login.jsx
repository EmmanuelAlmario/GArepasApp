import { useState } from 'react'
import { login as loginRequest } from '../api/auth'
import Button from '../components/Button'
import FormField from '../components/FormField'
import toast from 'react-hot-toast'

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [cargando, setCargando] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    try {
      const { data } = await loginRequest(form)
      onLogin(data)
      toast.success(`Bienvenido, ${data.username}`)
    } catch (err) {
      toast.error(err.response?.data?.mensaje ?? 'No se pudo iniciar sesión')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fff8e7]">
      <div className="w-full max-w-md">
        <div className="bg-[var(--brand-surface)] rounded-2xl shadow-xl border border-[#f4d177] overflow-hidden">
          <div className="h-1.5 brand-gradient" />

          <div className="px-8 pt-8 pb-6 text-center">
            <div className="mx-auto w-24 h-24 rounded-full overflow-hidden border-4 border-[#f4d177]">
              <img src="/gordo-arepas-logo.jpeg" alt="Gordo Arepas" className="w-full h-full object-cover" />
            </div>
            <h1 className="mt-4 text-2xl font-black text-[var(--brand-ink)] brand-display">Gordo Arepas</h1>
            <p className="text-sm text-[var(--brand-ink)]/60 mt-1">Inicia sesión para acceder al panel</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
            <FormField
              label="Usuario"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              autoFocus
            />
            <FormField
              label="Contraseña"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <Button type="submit" disabled={cargando} className="w-full">
              {cargando ? 'Iniciando…' : 'Iniciar sesión'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}