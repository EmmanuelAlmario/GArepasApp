import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Gestion from './pages/Gestion'
import Ventas from './pages/Ventas'
import Producciones from './pages/Producciones'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <BrowserRouter>
      <div className="min-h-screen flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col w-full min-w-0 md:ml-64">
          {/* Top bar móvil */}
          <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-[var(--brand-surface)]/90 backdrop-blur border-b border-[#f5e2af] md:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 -ml-1 rounded-lg hover:bg-[#fff4d6] text-[var(--brand-ink)]"
            >
              <Menu size={22} />
            </button>
            <span className="brand-display text-lg text-[var(--brand-ink)]">Gordo Arepas</span>
          </header>

          <main className="flex-1 min-w-0 p-4 md:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/gestion" element={<Gestion />} />
              <Route path="/ventas" element={<Ventas />} />
              <Route path="/producciones" element={<Producciones />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}
