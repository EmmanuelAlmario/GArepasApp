import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/insumos', label: 'Insumos' },
  { to: '/productos', label: 'Productos' },
  { to: '/recetas', label: 'Recetas' },
  { to: '/ventas', label: 'Ventas' },
  { to: '/gastos', label: 'Gastos' },
  { to: '/producciones', label: 'Producciones' },
  { to: '/empleados', label: 'Empleados' },
]

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-[#1a1d27] flex flex-col z-50">
      <div className="px-6 py-6 border-b border-white/10">
        <p className="text-xs text-white/40 font-semibold tracking-widest uppercase mb-1">AdminPanel</p>
        <h1 className="text-white text-lg font-bold tracking-tight">GArepas</h1>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            A
          </div>
          <div>
            <p className="text-white text-sm font-medium leading-none">Admin</p>
            <p className="text-white/40 text-xs mt-0.5">Administrador</p>
          </div>
        </div>
      </div>
    </aside>
  )
}