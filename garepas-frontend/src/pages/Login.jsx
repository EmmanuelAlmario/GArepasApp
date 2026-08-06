import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Lock, LogIn, Eye, EyeOff, Store } from 'lucide-react'
import { login as loginRequest } from '../api/auth'
import Button from '../components/Button'
import toast from 'react-hot-toast'

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [cargando, setCargando] = useState(false)
  const [verPass, setVerPass] = useState(false)

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

  const campo = (nombre, label, icon, type = 'text') => (
    <div>
      <label className="block text-xs font-extrabold uppercase tracking-wide mb-1.5" style={{ color: 'var(--muted)' }}>
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }}>
          {icon}
        </span>
        <input
          type={type}
          name={nombre}
          value={form[nombre]}
          onChange={handleChange}
          required
          autoFocus={nombre === 'username'}
          className="w-full pl-11 pr-10 py-3 rounded-xl border text-sm font-semibold outline-none focus:ring-2 focus:ring-[var(--brand-orange)]/30 transition-all"
          style={{
            background: 'var(--panel-2)',
            color: 'var(--ink)',
            borderColor: 'var(--border-strong)',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--brand-orange)' }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--border-strong)' }}
        />
        {nombre === 'password' && (
          <button
            type="button"
            onClick={() => setVerPass((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--muted)' }}
            aria-label="Mostrar contraseña"
          >
            {verPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--bg)', color: 'var(--ink)' }}
    >
      {/* Fondo decorativo */}
      <motion.div
        className="pointer-events-none absolute rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--brand-yellow), transparent 70%)', width: '480px', height: '480px', top: '-140px', left: '-120px' }}
        animate={{ y: [0, 24, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(242,140,40,0.35), transparent 70%)', width: '420px', height: '420px', bottom: '-120px', right: '-100px' }}
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl card"
        style={{ background: 'var(--panel)' }}
      >
        {/* Panel izquierdo (branding) */}
        <div className="hidden md:flex flex-col justify-between p-10 brand-gradient relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #fff 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Store size={22} className="text-white" />
            </div>
            <span className="text-white font-extrabold tracking-wide">GORDO AREPAS</span>
          </div>

          <div className="relative">
            <h1 className="font-display text-white text-4xl leading-tight">Controlando tu negocio, arepa por arepa.</h1>
            <p className="mt-4 text-white/85 text-sm leading-relaxed">
              Ventas, inventario, empleados y rentabilidad en un solo lugar, pensado para tu arepería.
            </p>
          </div>

          <div className="relative flex items-center gap-2 text-white/90 text-sm font-bold">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Panel en línea
          </div>
        </div>

        {/* Panel derecho (formulario) */}
        <div className="p-8 sm:p-10">
          <div className="flex md:hidden flex-col items-center mb-6">
            <img src="/gordo-arepas-logo.jpeg" alt="Gordo Arepas" className="w-20 h-20 rounded-full object-cover border-4" style={{ borderColor: 'var(--brand-yellow)' }} />
            <h1 className="mt-3 font-display text-2xl text-center" style={{ color: 'var(--ink)' }}>Gordo Arepas</h1>
          </div>

          <h2 className="font-display text-3xl text-center md:text-left" style={{ color: 'var(--ink)' }}>Bienvenido de nuevo</h2>
          <p className="mt-1 text-sm text-center md:text-left" style={{ color: 'var(--muted)' }}>
            Inicia sesión para acceder al panel
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            {campo('username', 'Usuario', <User size={17} />)}
            <div className="space-y-1.5">
              {campo('password', 'Contraseña', <Lock size={18} />, 'password')}
            </div>

            <Button type="submit" disabled={cargando} className="w-full !py-3">
              {cargando ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Iniciando…
                </span>
              ) : (
                <>
                  <LogIn size={17} /> Iniciar sesión
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs" style={{ color: 'var(--muted)' }}>
            Gordo Arepas · Gestión para areperías
          </p>
        </div>
      </motion.div>
    </div>
  )
}