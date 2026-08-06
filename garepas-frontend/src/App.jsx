import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Gestion from './pages/Gestion'
import Ventas from './pages/Ventas'
import Producciones from './pages/Producciones'
import Login from './pages/Login'
import { leerSesion, guardarSesion, cerrarSesion } from './api/auth'

export default function App() {
  const [auth, setAuth] = useState(leerSesion)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogin = (data) => {
    guardarSesion(data)
    setAuth(data)
  }

  const handleLogout = () => {
    cerrarSesion()
    setAuth(null)
    setSidebarOpen(false)
  }

  if (!auth) {
    return <Login onLogin={handleLogin} />
  }

  const esAdmin = auth.rol === 'ADMIN'

  return (
    <BrowserRouter>
      <div className="min-h-screen flex">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          rol={auth.rol}
          onLogout={handleLogout}
        />

        <div className="flex-1 flex flex-col w-full min-w-0 md:ml-64">
          {/* Top bar móvil */}
          <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-[var(--brand-surface)]/90 backdrop-blur border-b border-[#f5e2af] md:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 -ml-1 rounded-lg hover:bg-[#fff4d6] text-[var(--brand-ink)]"
              aria-label="Abrir menú"
            >
              <Menu size={22} />
            </button>
            <span className="brand-display text-lg text-[var(--brand-ink)]">Gordo Arepas</span>
          </header>

          <main className="flex-1 min-w-0 p-4 md:p-8">
            <Routes>
              {esAdmin ? (
                <>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/gestion" element={<Gestion />} />
                  <Route path="/producciones" element={<Producciones />} />
                </>
              ) : (
                <Route path="/" element={<Navigate to="/ventas" replace />} />
              )}
              <Route path="/ventas" element={<Ventas />} />
              <Route path="*" element={<Navigate to={esAdmin ? '/' : '/ventas'} replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}