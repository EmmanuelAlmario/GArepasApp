import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Button from '../components/Button'
import FormField from '../components/FormField'
import StatusBadge from '../components/StatusBadge'
import { getProductos, createProducto, updateProducto, deleteProducto } from '../api/productos'
import { getRecetas } from '../api/recetas'

const inicial = { nombre: '', stockActual: '', precioVenta: '', recetaId: '', activo: true }

export default function Productos() {
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
    { key: 'precioVenta', label: 'Precio venta', render: (v) => `$${v}` },
    { key: 'recetaNombre', label: 'Receta' },
    { key: 'activo', label: 'Estado', render: (v) => <StatusBadge activo={v} /> },
  ]

  const recetaOpts = recetas.map((r) => ({ value: r.id, label: r.nombre }))

  return (
    <div>
      <PageHeader title="Productos">
        <Button onClick={() => { setForm(inicial); setEditando(null); setModal(true) }}>
          + Agregar producto
        </Button>
      </PageHeader>

      <DataTable columns={columns} data={productos} onEdit={handleEditar} onDelete={handleEliminar} />

      {modal && (
        <Modal title={editando ? 'Editar producto' : 'Agregar producto'} onClose={() => setModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Stock actual" name="stockActual" type="number" value={form.stockActual} onChange={handleChange} required />
              <FormField label="Precio de venta" name="precioVenta" type="number" value={form.precioVenta} onChange={handleChange} required />
            </div>
            <FormField label="Receta (opcional)" name="recetaId" type="select" value={form.recetaId} onChange={handleChange} options={recetaOpts} />
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