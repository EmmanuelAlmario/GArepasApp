import { useCallback, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Menu } from 'lucide-react'
import Sidebar from './components/Sidebar'
import PageTransition from './components/PageTransition'
import useDarkMode from './hooks/useDarkMode'
import { toast } from 'react-hot-toast'
import Dashboard from './pages/Dashboard'
import Gestion from './pages/Gestion'
import Reportes from './pages/Reportes'
import Ventas from './pages/Ventas'
import Producciones from './pages/Producciones'
import Usuarios from './pages/Usuarios'
import Auditoria from './pages/Auditoria'
import MenuPublico from './pages/Menu'
import Login from './pages/Login'
import { leerSesion, guardarSesion, cerrarSesion } from './api/auth'

function Shell({ auth, sidebarOpen, setSidebarOpen, dark, toggle, onLogout }) {
  const location = useLocation()
  const esAdmin = auth.rol === 'ADMIN'

  return (
    <div className="min-h-screen flex">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        rol={auth.rol}
        dark={dark}
        onToggleTheme={toggle}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col w-full min-w-0 md:pl-72">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 backdrop-blur border-b border-[var(--border)] md:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 -ml-1 rounded-lg hover:bg-white/60 dark:hover:bg-white/10"
              aria-label="Abrir menú"
            >
              <Menu size={22} />
            </button>
            <span className="brand-display text-lg">Gordo Arepas</span>
          </div>
        </header>

        <main className="flex-1 min-w-0 p-4 md:p-8">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Routes location={location}>
                {esAdmin ? (
                  <>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/gestion" element={<Gestion />} />
                    <Route path="/reportes" element={<Reportes />} />
                    <Route path="/producciones" element={<Producciones />} />
                    <Route path="/usuarios" element={<Usuarios />} />
                    <Route path="/auditoria" element={<Auditoria />} />
                  </>
                ) : (
                  <Route path="/" element={<Navigate to="/ventas" replace />} />
                )}
                <Route path="/ventas" element={<Ventas />} />
                <Route path="/menu" element={<MenuPublico />} />
                <Route path="*" element={<Navigate to={esAdmin ? '/' : '/ventas'} replace />} />
              </Routes>
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const [auth, setAuth] = useState(leerSesion)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, toggle } = useDarkMode()

  const handleLogout = useCallback(() => {
    cerrarSesion()
    setAuth(null)
    setSidebarOpen(false)
  }, [])

  useEffect(() => {
    const onUnauthorized = () => {
      toast.error('Tu sesión expiró. Inicia sesión de nuevo.')
      handleLogout()
    }
    window.addEventListener('garepas:logout', onUnauthorized)
    return () => window.removeEventListener('garepas:logout', onUnauthorized)
  }, [handleLogout])

  const handleLogin = (data) => {
    guardarSesion(data)
    setAuth(data)
  }

  return (
    <BrowserRouter>
      <PublicGate auth={auth} onLogin={handleLogin} onLogout={handleLogout} setup={{ sidebarOpen, setSidebarOpen, dark: theme === 'dark', toggle }} />
    </BrowserRouter>
  )
}

function PublicGate({ auth, onLogin, onLogout, setup }) {
  const location = useLocation()
  const esMenu = location.pathname === '/menu'

  if (!auth) {
    return esMenu ? <MenuPublico /> : <Login onLogin={onLogin} />
  }
  return <Shell {...{ esAdmin: auth.rol === 'ADMIN', auth, ...setup, onLogout }} />
}