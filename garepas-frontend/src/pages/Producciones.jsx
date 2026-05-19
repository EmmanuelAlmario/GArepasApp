import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Button from '../components/Button'
import FormField from '../components/FormField'
import { getProducciones, createProduccion, deleteProduccion } from '../api/producciones'
import { getProductos } from '../api/productos'

const inicial = { productoId: '', cantidad: '' }

export default function Producciones() {
  const [producciones, setProducciones] = useState([])
  const [productos, setProductos] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(inicial)

  const cargar = () => getProducciones().then((r) => setProducciones(r.data)).catch(console.error)

  useEffect(() => {
    cargar()
    getProductos()
      .then((r) => setProductos(r.data.filter((p) => p.activo && p.recetaId)))
      .catch(console.error)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      productoId: Number(form.productoId),
      cantidad: Number(form.cantidad),
    }
    try {
      await createProduccion(payload)
      setModal(false)
      setForm(inicial)
      cargar()
    } catch (err) {
      alert(err.response?.data?.mensaje ?? 'Error al registrar producción')
    }
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar esta producción? Se revertirá el stock de insumos y producto.')) return
    try {
      await deleteProduccion(id)
      cargar()
    } catch (err) {
      alert(err.response?.data?.mensaje ?? 'Error al eliminar')
    }
  }

  const columns = [
    { key: 'id', label: '#', render: (v) => `#${v}` },
    { key: 'productoNombre', label: 'Producto' },
    { key: 'cantidad', label: 'Cantidad producida' },
    {
      key: 'fecha', label: 'Fecha',
      render: (v) => new Date(v).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
    {
      key: 'detalles', label: 'Insumos OK',
      render: (v) => {
        const total = v?.length ?? 0
        const ok = v?.filter((d) => d.suficiente).length ?? 0
        return (
          <span className={`text-xs font-medium ${ok === total ? 'text-green-600' : 'text-yellow-600'}`}>
            {ok}/{total}
          </span>
        )
      },
    },
  ]

  const productoOpts = productos.map((p) => ({ value: p.id, label: p.nombre }))

  return (
    <div>
      <PageHeader title="Producciones">
        <Button onClick={() => { setForm(inicial); setModal(true) }}>
          + Registrar producción
        </Button>
      </PageHeader>

      <DataTable columns={columns} data={producciones} onDelete={handleEliminar} />

      {modal && (
        <Modal title="Registrar producción" onClose={() => setModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Producto"
              name="productoId"
              type="select"
              value={form.productoId}
              onChange={handleChange}
              options={productoOpts}
              required
            />
            <FormField
              label="Cantidad a producir"
              name="cantidad"
              type="number"
              value={form.cantidad}
              onChange={handleChange}
              required
            />
            <p className="text-xs text-gray-400">
              Solo aparecen productos con receta asignada. Al registrar, el sistema verificará el stock de insumos automáticamente.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
              <Button type="submit" variant="success">Registrar producción</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}