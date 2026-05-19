import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Insumos from './pages/Insumos'
import Productos from './pages/Productos'
import Recetas from './pages/Recetas'
import Ventas from './pages/Ventas'
import Gastos from './pages/Gastos'
import Producciones from './pages/Producciones'
import Empleados from './pages/Empleados'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <main className="ml-56 flex-1 p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/insumos" element={<Insumos />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/recetas" element={<Recetas />} />
            <Route path="/ventas" element={<Ventas />} />
            <Route path="/gastos" element={<Gastos />} />
            <Route path="/producciones" element={<Producciones />} />
            <Route path="/empleados" element={<Empleados />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}