import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Button from '../components/Button'
import FormField from '../components/FormField'
import { getVentas, createVenta, deleteVenta } from '../api/ventas'
import { getProductos } from '../api/productos'

const detalleInicial = { productoId: '', cantidad: '', precioUnitario: '' }

export default function Ventas() {
  const [ventas, setVentas] = useState([])
  const [productos, setProductos] = useState([])
  const [modal, setModal] = useState(false)
  const [detalles, setDetalles] = useState([{ ...detalleInicial }])

  const cargar = () => getVentas().then((r) => setVentas(r.data)).catch(console.error)

  useEffect(() => {
    cargar()
    getProductos().then((r) => setProductos(r.data.filter((p) => p.activo))).catch(console.error)
  }, [])

  const handleDetalleChange = (i, e) => {
    const { name, value } = e.target
    setDetalles((prev) => {
      const next = [...prev]
      next[i] = { ...next[i], [name]: value }
      if (name === 'productoId') {
        const prod = productos.find((p) => p.id === Number(value))
        if (prod) next[i].precioUnitario = prod.precioVenta
      }
      return next
    })
  }

  const agregarDetalle = () => setDetalles((p) => [...p, { ...detalleInicial }])
  const quitarDetalle = (i) => setDetalles((p) => p.filter((_, idx) => idx !== i))

  const totalCalculado = detalles.reduce((acc, d) => {
    return acc + (Number(d.cantidad) * Number(d.precioUnitario) || 0)
  }, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      detalles: detalles.map((d) => ({
        productoId: Number(d.productoId),
        cantidad: Number(d.cantidad),
      })),
    }
    try {
      await createVenta(payload)
      setModal(false)
      setDetalles([{ ...detalleInicial }])
      cargar()
    } catch (err) {
      alert(err.response?.data?.mensaje ?? 'Error al registrar venta')
    }
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar esta venta? Se revertirá el stock.')) return
    try {
      await deleteVenta(id)
      cargar()
    } catch (err) {
      alert(err.response?.data?.mensaje ?? 'Error al eliminar')
    }
  }

  const fmt = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

  const columns = [
    { key: 'id', label: '#', render: (v) => `#${v}` },
    {
      key: 'fecha', label: 'Fecha',
      render: (v) => new Date(v).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
    { key: 'detalles', label: 'Productos', render: (v) => `${v?.length ?? 0} producto(s)` },
    { key: 'total', label: 'Total', render: (v) => fmt(v) },
  ]

  const productoOpts = productos.map((p) => ({ value: p.id, label: p.nombre }))

  return (
    <div>
      <PageHeader title="Ventas">
        <Button onClick={() => { setDetalles([{ ...detalleInicial }]); setModal(true) }}>
          + Registrar venta
        </Button>
      </PageHeader>

      <DataTable columns={columns} data={ventas} onDelete={handleEliminar} />

      {modal && (
        <Modal title="Registrar venta" onClose={() => setModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Productos</label>
                <button type="button" onClick={agregarDetalle} className="text-xs text-blue-600 hover:underline font-medium">
                  + Agregar producto
                </button>
              </div>
              <div className="space-y-2">
                {detalles.map((d, i) => (
                  <div key={i} className="grid grid-cols-2 sm:grid-cols-[1fr_70px_100px_32px] gap-2 items-end">
                    <div className="col-span-2 sm:col-span-1">
                      <FormField label={i === 0 ? 'Producto' : ''} name="productoId" type="select" value={d.productoId} onChange={(e) => handleDetalleChange(i, e)} options={productoOpts} required />
                    </div>
                    <FormField label={i === 0 ? 'Cant.' : ''} name="cantidad" type="number" value={d.cantidad} onChange={(e) => handleDetalleChange(i, e)} required />
                    <FormField label={i === 0 ? 'Precio unit.' : ''} name="precioUnitario" type="number" value={d.precioUnitario} onChange={(e) => handleDetalleChange(i, e)} required />
                    <button type="button" onClick={() => quitarDetalle(i)} className="text-red-400 hover:text-red-600 text-lg pb-1">×</button>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-[var(--brand-ink)]/60">El precio final se toma del servidor para evitar manipulaciones.</p>

            <div className="bg-gray-50 rounded-lg px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-gray-500 font-medium">Total estimado</span>
              <span className="text-lg font-bold text-gray-800">{fmt(totalCalculado)}</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
              <Button type="submit" variant="success">Registrar venta</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
