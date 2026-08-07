import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ClipboardList, ShoppingCart, Factory, Users, X, LogOut, Sun, Moon, BarChart3, ScrollText,
} from 'lucide-react'
import { motion } from 'framer-motion'

const GROUPS = [
  {
    label: 'Gestión',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN'] },
      { to: '/gestion', label: 'Inventario', icon: ClipboardList, roles: ['ADMIN'] },
      { to: '/reportes', label: 'Reportes', icon: BarChart3, roles: ['ADMIN'] },
      { to: '/producciones', label: 'Producciones', icon: Factory, roles: ['ADMIN'] },
    ],
  },
  {
    label: 'Ventas',
    items: [{ to: '/ventas', label: 'Punto de venta', icon: ShoppingCart, roles: ['ADMIN', 'VENTAS'] }],
  },
  {
    label: 'Administración',
    items: [
      { to: '/usuarios', label: 'Usuarios', icon: Users, roles: ['ADMIN'] },
      { to: '/auditoria', label: 'Auditoría', icon: ScrollText, roles: ['ADMIN'] },
    ],
  },
]

const activeGroups = (rol) =>
  GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => i.roles.includes(rol)) })).filter((g) => g.items.length > 0)

export default function Sidebar({ open, onClose, rol, dark, onToggleTheme, onLogout }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={onClose} />}

      <aside
        className={`fixed top-0 left-0 h-screen w-72 flex flex-col z-50 shadow-2xl transition-transform duration-300 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#4a2f1d] via-[#3a2517] to-[#241708] -z-10" />

        <button onClick={onClose} className="absolute top-4 right-3 text-white/60 hover:text-white text-2xl leading-none md:hidden z-10">
          <X size={20} />
        </button>

        <div className="px-5 pt-6 pb-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[var(--brand-yellow)] text-xl brand-display leading-none">Gordo Arepas</h1>
              <p className="text-xs text-white/50 font-semibold mt-1">Panel de gestión</p>
            </div>
            <ThemeToggleButton dark={dark} onToggle={onToggleTheme} />
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
          {activeGroups(rol).map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-white/35">{group.label}</p>
              <div className="space-y-1">
                {group.items.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                        isActive ? 'text-[var(--brand-ink)]' : 'text-white/65 hover:text-white hover:bg-white/8'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span
                            layoutId="nav-active"
                            className="absolute inset-0 rounded-xl bg-[var(--brand-yellow)] shadow-lg shadow-yellow-500/30"
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          />
                        )}
                        <Icon size={17} className={`relative transition-colors ${isActive ? 'text-[var(--brand-red)]' : ''}`} />
                        <span className="relative">{label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full brand-gradient flex items-center justify-center text-white text-xs font-bold uppercase">
              {rol ? rol.slice(0, 1) : '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold leading-none uppercase">{rol}</p>
              <p className="text-white/45 text-xs mt-0.5">{rolEtiqueta(rol)}</p>
            </div>
            <button onClick={onLogout} title="Cerrar sesión" aria-label="Cerrar sesión" className="text-white/50 hover:text-white transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

function ThemeToggleButton({ dark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={dark ? 'Modo claro' : 'Modo oscuro'}
      aria-label="Cambiar tema"
      className="w-9 h-9 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  )
}

const rolEtiqueta = (rol) =>
  rol === 'ADMIN' ? 'Administrador' : rol === 'VENTAS' ? 'Registrador de ventas' : 'Operación diaria'