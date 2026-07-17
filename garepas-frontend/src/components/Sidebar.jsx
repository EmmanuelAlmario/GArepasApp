import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, ShoppingCart, Factory, X } from 'lucide-react'

const links = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { to: '/gestion', label: 'Gestion', icon: <ClipboardList size={16} /> },
  { to: '/ventas', label: 'Ventas', icon: <ShoppingCart size={16} /> },
  { to: '/producciones', label: 'Producciones', icon: <Factory size={16} /> },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Backdrop móvil */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-[var(--brand-ink)] flex flex-col z-50 shadow-2xl transition-transform duration-300 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Botón cerrar (solo móvil) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-3 text-white/60 hover:text-white text-2xl leading-none md:hidden"
        >
          <X size={20} />
        </button>

        <div className="px-4 py-5 border-b border-white/10">
          <img
            src="/gordo-arepas-logo.jpeg"
            alt="Gordo Arepas"
            className="w-full h-30 object-cover rounded-xl border border-white/15"
          />
          <h1 className="mt-3 text-[var(--brand-yellow)] text-lg brand-display leading-tight">Gordo Arepas</h1>
          <p className="text-xs text-white/70 font-semibold">Panel de gestion</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[var(--brand-yellow)] text-[var(--brand-ink)] shadow-lg shadow-[#ffcc33]/20'
                    : 'text-white/70 hover:text-white hover:bg-white/8'
                }`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10 bg-black/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full brand-gradient flex items-center justify-center text-white text-xs font-bold">
              G
            </div>
            <div>
              <p className="text-white text-sm font-medium leading-none">Gordo Arepas</p>
              <p className="text-white/50 text-xs mt-0.5">Operacion diaria</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
