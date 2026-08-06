import { useEffect, useState } from 'react'
import { getProductos } from '../api/productos'

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0)

export default function Menu() {
  const [productos, setProductos] = useState([])
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    getProductos()
      .then((r) => setProductos(r.data.filter((p) => p.activo)))
      .catch(() => setProductos([]))
  }, [])

  const filtrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())
  )

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="brand-display text-4xl" style={{ color: 'var(--brand-orange)' }}>Gordo Arepas</h1>
          <p className="text-sm muted mt-2">Menú · selecciona tus favoritas</p>
        </div>

        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar en el menú…"
          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-sm mb-6 outline-none focus:ring-2 focus:ring-[var(--brand-orange)]/30"
          style={{ background: 'var(--panel)', color: 'var(--ink)' }}
        />

        {filtrados.length === 0 ? (
          <p className="muted text-center text-sm py-16">Sin productos disponibles por ahora</p>
        ) : (
          <div className="space-y-3">
            {filtrados.map((p) => (
              <div
                key={p.id}
                className="card px-5 py-4 flex items-center justify-between gap-3"
                style={{ background: 'var(--panel)' }}
              >
                <div>
                  <p className="font-bold text-base" style={{ color: 'var(--ink)' }}>{p.nombre}</p>
                  {p.stockActual === 0 && (
                    <p className="text-xs font-bold text-[var(--brand-danger)] mt-0.5">Agotado</p>
                  )}
                </div>
                <span className="font-num font-extrabold text-lg" style={{ color: 'var(--brand-orange)' }}>
                  {fmt(p.precioVenta)}
                </span>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-xs muted mt-10">Hecho con 💛 · Gordo Arepas</p>
      </div>
    </div>
  )
}