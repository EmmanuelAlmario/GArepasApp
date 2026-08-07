import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus, Trash2, Search, ShoppingCart, ClipboardList, CalendarClock } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import Paginador from '../components/Paginador'
import { getVentas, createVenta, deleteVenta } from '../api/ventas'
import { getProductos } from '../api/productos'
import { leerSesion } from '../api/auth'
import { getJornadaActiva, abrirJornada, cerrarJornada } from '../api/jornadas'
import { downloadCSV, fechaCSV } from '../utils/export'
import ConfirmDialog from '../components/ConfirmDialog'
import toast from 'react-hot-toast'

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0)

export default function Ventas() {
  const [ventas, setVentas] = useState([])
  const [productos, setProductos] = useState([])
  const [view, setView] = useState('pos') // 'pos' | 'historial'
  const [busqueda, setBusqueda] = useState('')
  const [busquedaHist, setBusquedaHist] = useState('')
  const [pageHist, setPageHist] = useState(1)
  const [carrito, setCarrito] = useState([])
  const [cliente, setCliente] = useState('')
  const [jornada, setJornada] = useState(null)
  const [arqueo, setArqueo] = useState(null)
  const [abriendo, setAbriendo] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [confirmId, setConfirmId] = useState(null)
  const buscadorRef = useRef(null)

  const sesion = leerSesion()
  const puedeEliminar = sesion?.rol === 'ADMIN'

  useEffect(() => {
    let activo = true
    Promise.allSettled([
      getVentas().then((r) => activo && setVentas(r.data)),
      getProductos().then((r) => activo && setProductos(r.data.filter((p) => p.activo))),
      getJornadaActiva().then((r) => activo && setJornada(r.data)),
    ]).finally(() => activo && setCargando(false))
    return () => { activo = false }
  }, [])

  const abrirDia = async () => {
    setAbriendo(true)
    try {
      const { data } = await abrirJornada()
      setJornada(data)
      setArqueo(null)
      toast.success('Jornada abierta. Las ventas de ahora en adelante se contabilizan en este día.')
    } catch (err) {
      toast.error(err.response?.data?.mensaje ?? 'No se pudo abrir la jornada')
    } finally {
      setAbriendo(false)
    }
  }

  const cerrarDia = async () => {
    if (!jornada) return
    try {
      const { data } = await cerrarJornada(jornada.id)
      setArqueo(data)
      setJornada(null)
      toast.success('Día cerrado. Este es tu arqueo.')
    } catch (err) {
      toast.error(err.response?.data?.mensaje ?? 'No se pudo cerrar la jornada')
    }
  }

  const inventario = useMemo(() => productos.filter((p) => p.activo), [productos])
  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return inventario
    return inventario.filter((p) => p.nombre.toLowerCase().includes(q))
  }, [inventario, busqueda])

  const enCarrito = (prodId) => carrito.find((c) => c.id === prodId)

  const agregar = (prod) => {
    setCarrito((prev) => {
      const exist = prev.find((c) => c.id === prod.id)
      const cantidadActual = exist ? exist.qty : 0
      if (prod.stockActual != null && cantidadActual >= prod.stockActual) {
        toast.error('Stock insuficiente para ' + prod.nombre)
        return prev
      }
      if (exist) return prev.map((c) => (c.id === prod.id ? { ...c, qty: c.qty + 1 } : c))
      return [...prev, { id: prod.id, nombre: prod.nombre, precio: Number(prod.precioVenta), qty: 1, stock: prod.stockActual }]
    })
  }

  const cambiarCantidad = (id, delta) => {
    setCarrito((prev) =>
      prev
        .map((c) => {
          if (c.id !== id) return c
          const nueva = c.qty + delta
          if (delta > 0 && c.stock != null && nueva > c.stock) {
            toast.error('Stock insuficiente')
            return c
          }
          return { ...c, qty: nueva }
        })
        .filter((c) => c.qty > 0)
    )
  }

  const quitar = (id) => setCarrito((prev) => prev.filter((c) => c.id !== id))
  const limpiar = () => setCarrito([])

  const total = carrito.reduce((a, c) => a + c.precio * c.qty, 0)
  const totalItems = carrito.reduce((a, c) => a + c.qty, 0)

  const confirmar = async () => {
    if (carrito.length === 0) return
    const payload = { nombreCliente: cliente.trim() || null, detalles: carrito.map((c) => ({ productoId: c.id, cantidad: c.qty })) }
    try {
      await createVenta(payload)
      setCarrito([])
      setCliente('')
      getVentas().then((r) => setVentas(r.data)).catch(console.error)
      toast.success(`Venta registrada por ${fmt(total)}`)
      if (view === 'pos') buscadorRef.current?.focus()
    } catch (err) {
      toast.error(err.response?.data?.mensaje ?? 'Error al registrar la venta')
    }
  }

  const handleEliminar = async (id) => {
    try {
      await deleteVenta(id)
      getVentas().then((r) => setVentas(r.data)).catch(console.error)
    } catch {
      /* noop */
    } finally {
      setConfirmId(null)
    }
  }

  const exportarCSV = () =>
    downloadCSV('ventas', [
      { label: 'No.', get: (v) => `#${v.id}` },
      { label: 'Fecha', get: (v) => fechaCSV(v.fecha) },
      { label: 'Cliente', get: (v) => v.nombreCliente || '' },
      { label: 'Productos', get: (v) => v.detalles?.map((d) => `${d.productoNombre} x${d.cantidad}`).join('; ') || '' },
      { label: 'Cantidad', get: (v) => v.detalles?.reduce((a, d) => a + d.cantidad, 0) || 0 },
      { label: 'Total', get: (v) => Number(v.total) },
    ], ventas)

  const hoy = new Date().toDateString()
  const ventasHoy = ventas.filter((v) => new Date(v.fecha).toDateString() === hoy)
  const totalHoy = ventasHoy.reduce((a, v) => a + Number(v.total), 0)

  const qHist = busquedaHist.trim().toLowerCase()
  const ventasFiltradas = qHist
    ? ventas.filter((v) =>
        String(v.id).includes(qHist) ||
        (v.nombreCliente || '').toLowerCase().includes(qHist) ||
        (v.detalles || []).some((d) => d.productoNombre?.toLowerCase().includes(qHist)))
    : ventas
  const PAGE_HIST = 25
  const totalPagHist = Math.max(1, Math.ceil(ventasFiltradas.length / PAGE_HIST))
  const historialPag = ventasFiltradas.slice((pageHist - 1) * PAGE_HIST, pageHist * PAGE_HIST)

  const columns = [
    { key: 'id', label: '#', render: (v) => `#${v}` },
    { key: 'fecha', label: 'Fecha', render: (v) => new Date(v).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) },
    { key: 'nombreCliente', label: 'Cliente', render: (v) => v || '—' },
    { key: 'detalles', label: 'Productos', render: (v) => `${v?.length ?? 0} producto(s)` },
    { key: 'total', label: 'Total', render: (v) => fmt(v) },
  ]

  return (
    <div>
      <PageHeader title="Punto de venta" subtitle={`Hoy: ${ventasHoy.length} ventas · ${fmt(totalHoy)}`}>
        <div className="flex gap-2">
          <Button variant={view === 'pos' ? 'primary' : 'secondary'} onClick={() => setView('pos')} disabled={view === 'pos'}>
            <ShoppingCart size={16} /> Nueva venta
          </Button>
          <Button variant={view === 'historial' ? 'primary' : 'secondary'} onClick={() => setView('historial')}>
            <ClipboardList size={16} /> Historial
          </Button>
        </div>
      </PageHeader>

      {cargando ? (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="skeleton h-4 w-44 mb-3" />
            <div className="skeleton h-5 w-72" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="card p-4">
                <div className="skeleton h-3 w-24 mb-2" />
                <div className="skeleton h-6 w-16" />
                <div className="skeleton h-3 w-12 mt-2" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
      {/* Jornada: abrir / cerrar / arqueo */}
      <div className="mb-4">
        {jornada ? (
          <div className="card-soft flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 font-semibold" style={{ color: 'var(--ink)' }}>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Día abierto — desde {new Date(jornada.fechaApertura).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </div>
              <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
                Abrió {jornada.abiertaPor} · {jornada.nroVentas} venta(s) · {fmt(jornada.totalVentas)}
              </p>
            </div>
            <Button variant="secondary" onClick={cerrarDia}>
              Cerrar día
            </Button>
          </div>
        ) : arqueo ? (
          <div className="card flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3">
            <div className="flex-1">
              <div className="font-semibold" style={{ color: 'var(--ink)' }}>Arqueo del día</div>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Cerrado por {arqueo.abiertaPor} · {arqueo.nroVentas} venta(s) · <b>{fmt(arqueo.totalVentas)}</b>
              </p>
            </div>
            <Button variant="secondary" onClick={() => setArqueo(null)}>Entendido</Button>
          </div>
        ) : (
          <Button variant="secondary" onClick={abrirDia} disabled={abriendo} className="w-full sm:w-auto">
            <CalendarClock size={16} /> Abrir día de operación
          </Button>
        )}
      </div>

      {view === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Catálogo */}
          <div className="lg:col-span-2">
            <div className="relative mb-4">
              <Search size={18} className="absolute top-1/2 -translate-y-1/2 left-3 text-[var(--muted)]" />
              <input
                ref={buscadorRef}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar producto…"
                aria-label="Buscar producto"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:ring-2 focus:ring-[var(--brand-orange)]/30"
                style={{ background: 'var(--panel-2)', color: 'var(--ink)' }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtrados.map((p) => {
                const en = enCarrito(p)
                return (
                  <motion.button
                    key={p.id}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => agregar(p)}
                    className="card p-4 text-left flex flex-col gap-1 relative hover:border-[var(--brand-orange)] transition-colors"
                    style={{ background: en ? 'var(--brand-yellow-soft)' : 'var(--panel)' }}
                  >
                    {en && (
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full brand-gradient text-white text-xs font-bold flex items-center justify-center shadow-lg">
                        {en.qty}
                      </span>
                    )}
                    <span className="font-bold text-sm leading-tight" style={{ color: 'var(--ink)' }}>{p.nombre}</span>
                    <span className="font-num font-extrabold" style={{ color: 'var(--brand-orange)' }}>{fmt(p.precioVenta)}</span>
                    <span className="text-xs text-[var(--muted)]">Stock: {p.stockActual ?? '—'}</span>
                  </motion.button>
                )
              })}
              {filtrados.length === 0 && (
                <p className="col-span-full muted text-sm text-center py-10">Sin resultados</p>
              )}
            </div>
          </div>

          {/* Carrito */}
          <div className="card p-4 flex flex-col h-fit lg:sticky lg:top-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>Orden actual</h3>
              {carrito.length > 0 && (
                <button onClick={limpiar} className="text-xs text-[var(--brand-danger)] hover:underline font-medium">Vaciar</button>
              )}
            </div>

            {carrito.length === 0 ? (
              <p className="muted text-sm text-center py-10">Toque un producto para agregarlo</p>
            ) : (
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1 mb-4">
                {carrito.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 p-2.5 rounded-lg border border-[var(--border)]" style={{ background: 'var(--panel-2)' }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>{c.nombre}</p>
                      <p className="text-xs text-[var(--muted)]">{fmt(c.precio)} c/u</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => cambiarCantidad(c.id, -1)} aria-label={`Quitar uno a ${c.nombre}`} className="w-7 h-7 rounded-md flex items-center justify-center border border-[var(--border)] hover:bg-[var(--panel)]" style={{ color: 'var(--ink)' }}><Minus size={14} /></button>
                      <span className="w-8 text-center font-bold text-sm" style={{ color: 'var(--ink)' }}>{c.qty}</span>
                      <button onClick={() => cambiarCantidad(c.id, 1)} aria-label={`Agregar uno a ${c.nombre}`} className="w-7 h-7 rounded-md flex items-center justify-center border border-[var(--border)] hover:bg-[var(--panel)]" style={{ color: 'var(--ink)' }}><Plus size={14} /></button>
                    </div>
                    <span className="w-16 text-right font-bold text-sm" style={{ color: 'var(--ink)' }}>{fmt(c.precio * c.qty)}</span>
                    <button onClick={() => quitar(c.id)} aria-label={`Quitar ${c.nombre} del pedido`} className="text-[var(--brand-danger)] hover:bg-[#fde7e4] p-1 rounded-md"><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-[var(--border)] pt-3 space-y-1 mb-3">
              <div className="flex justify-between text-sm text-[var(--muted)]"><span>Productos</span><span>{totalItems}</span></div>
              <div className="flex items-center justify-between">
                <span className="font-bold" style={{ color: 'var(--ink)' }}>Total</span>
                <span className="font-num text-2xl font-extrabold" style={{ color: 'var(--brand-orange)' }}>{fmt(total)}</span>
              </div>
            </div>

            <form onSubmit={confirmar}>
              <input
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Cliente (opcional)"
                aria-label="Nombre del cliente (opcional)"
                maxLength={100}
                className="w-full mb-3 px-3 py-2.5 rounded-lg border border-[var(--border)] text-sm outline-none focus:ring-2 focus:ring-[var(--brand-orange)]/30"
                style={{ background: 'var(--panel-2)', color: 'var(--ink)' }}
              />

              <Button type="submit" variant="success" disabled={carrito.length === 0}>
                Cobrar {total > 0 ? fmt(total) : ''}
              </Button>
            </form>
          </div>
        </div>
      )}

      {view === 'historial' && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <div className="relative flex-1">
              <Search size={17} className="absolute top-1/2 -translate-y-1/2 left-3 text-[var(--muted)]" />
              <input
                value={busquedaHist}
                onChange={(e) => { setBusquedaHist(e.target.value); setPageHist(1) }}
                placeholder="Buscar por cliente, producto o número…"
                aria-label="Buscar en el historial de ventas"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none focus:ring-2 focus:ring-[var(--brand-orange)]/30"
                style={{ background: 'var(--panel-2)', color: 'var(--ink)' }}
              />
            </div>
            <Button variant="secondary" onClick={exportarCSV} disabled={ventas.length === 0}>
              Descargar CSV
            </Button>
          </div>
<div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-[var(--border)]" style={{ background: 'var(--panel-2)' }}>
                  {columns.map((c) => <th key={c.key} className="text-left px-5 py-3.5 text-xs font-bold text-[var(--muted)] uppercase tracking-wide">{c.label}</th>)}
                  {puedeEliminar && <th className="text-right px-5 py-3.5 text-xs font-bold text-[var(--muted)] uppercase tracking-wide">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {ventasFiltradas.length === 0 && (
                  <tr><td colSpan={columns.length + 1} className="text-center py-12 muted text-sm">{qHist ? 'Sin coincidencias' : 'Sin ventas registradas'}</td></tr>
                )}
                {historialPag.map((v) => (
                  <tr key={v.id} className="hover:bg-[var(--panel-2)] transition-colors">
                    {columns.map((c) => <td key={c.key} className="px-5 py-3.5" style={{ color: 'var(--ink)' }}>{c.render ? c.render(v[c.key]) : v[c.key]}</td>)}
                    {puedeEliminar && (
                      <td className="px-5 py-3.5 text-right">
                        <button onClick={() => setConfirmId(v.id)} className="text-xs px-3 py-1.5 rounded-lg bg-[#fde7e4] text-[var(--brand-danger)] hover:bg-[#fbd4ce] font-bold transition-colors">
                          Eliminar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Paginador page={Math.min(pageHist, totalPagHist)} totalPages={totalPagHist} total={ventasFiltradas.length} onPage={setPageHist} />
        </div>
        </>
      )}
    </>
      )}

      <ConfirmDialog
        open={!!confirmId}
        title="Eliminar venta"
        message="¿Eliminar esta venta? Se revertirá el stock correspondiente."
        onConfirm={() => handleEliminar(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}