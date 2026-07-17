import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Button from '../components/Button'
import FormField from '../components/FormField'
import StatusBadge from '../components/StatusBadge'
import { getProductos, createProducto, updateProducto, deleteProducto } from '../api/productos'
import { getRecetas } from '../api/recetas'
import { getCostoReceta, getSugerenciaPrecio } from '../api/costos'

const inicial = { nombre: '', stockActual: '', precioVenta: '', recetaId: '', activo: true }
const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0)

export default function Productos({ embedded = false }) {
  const [productos, setProductos] = useState([])
  const [recetas, setRecetas] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(inicial)
  const [editando, setEditando] = useState(null)

  const cargar = () => getProductos().then((r) => setProductos(r.data)).catch(console.error)

  useEffect(() => {
    cargar()
    getRecetas().then((r) => setRecetas(r.data)).catch(console.error)
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      stockActual: Number(form.stockActual),
      precioVenta: Number(form.precioVenta),
      recetaId: form.recetaId ? Number(form.recetaId) : null,
    }
    try {
      if (editando) {
        await updateProducto(editando, payload)
      } else {
        await createProducto(payload)
      }
      setModal(false)
      setForm(inicial)
      setEditando(null)
      cargar()
    } catch (err) {
      alert(err.response?.data?.mensaje ?? 'Error al guardar')
    }
  }

  const sugerirPrecio = async (margen = 0.4) => {
    if (!form.recetaId) return
    try {
      if (editando) {
        const res = await getSugerenciaPrecio(editando, margen)
        setForm((f) => ({ ...f, precioVenta: Number(res.data.precioSugerido) }))
      } else {
        const costo = await getCostoReceta(Number(form.recetaId))
        const sugerido = Number(costo.data.costoTotal) * (1 + margen)
        setForm((f) => ({ ...f, precioVenta: sugerido.toFixed(2) }))
      }
    } catch {
      // no-op
    }
  }

  const handleEditar = (row) => {
    setForm({ ...row, recetaId: row.recetaId ?? '' })
    setEditando(row.id)
    setModal(true)
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await deleteProducto(id)
      cargar()
    } catch (err) {
      alert(err.response?.data?.mensaje ?? 'Error al eliminar')
    }
  }

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'stockActual', label: 'Stock' },
    { key: 'precioVenta', label: 'Precio venta', render: (v) => fmt(v) },
    { key: 'costoUnitario', label: 'Costo unitario', render: (v) => fmt(v) },
    { key: 'margenPorcentaje', label: 'Margen %', render: (v) => `${Number(v || 0).toFixed(1)}%` },
    { key: 'recetaNombre', label: 'Receta' },
    { key: 'activo', label: 'Estado', render: (v) => <StatusBadge activo={v} /> },
  ]

  const recetaOpts = recetas.map((r) => ({ value: r.id, label: r.nombre }))

  return (
    <div>
      {!embedded && (
        <PageHeader title="Productos">
          <Button onClick={() => { setForm(inicial); setEditando(null); setModal(true) }}>
            + Agregar producto
          </Button>
        </PageHeader>
      )}
      {embedded && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => { setForm(inicial); setEditando(null); setModal(true) }}>
            + Agregar producto
          </Button>
        </div>
      )}

      <DataTable columns={columns} data={productos} onEdit={handleEditar} onDelete={handleEliminar} />

      {modal && (
        <Modal title={editando ? 'Editar producto' : 'Agregar producto'} onClose={() => setModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Stock actual" name="stockActual" type="number" value={form.stockActual} onChange={handleChange} required />
              <FormField label="Precio de venta" name="precioVenta" type="number" value={form.precioVenta} onChange={handleChange} required />
            </div>
            <FormField label="Receta (opcional)" name="recetaId" type="select" value={form.recetaId} onChange={handleChange} options={recetaOpts} />
            {form.recetaId && (
              <div className="bg-[#fff0c7] border border-[#f6d375] rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-bold text-[var(--brand-ink)]">Sugerir precio con margen</span>
                <Button variant="secondary" onClick={() => sugerirPrecio(0.4)}>40%</Button>
              </div>
            )}
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} className="rounded" />
              Activo
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
              <Button type="submit">{editando ? 'Guardar cambios' : 'Crear producto'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
