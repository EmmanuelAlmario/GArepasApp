import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Button from '../components/Button'
import FormField from '../components/FormField'
import { getGastos, createGasto, updateGasto, deleteGasto } from '../api/gastos'

const inicial = { descripcion: '', monto: '', categoria: '' }

export default function Gastos() {
  const [gastos, setGastos] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(inicial)
  const [editando, setEditando] = useState(null)

  const cargar = () => getGastos().then((r) => setGastos(r.data)).catch(console.error)

  useEffect(() => { cargar() }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...form, monto: Number(form.monto) }
    try {
      if (editando) {
        await updateGasto(editando, payload)
      } else {
        await createGasto(payload)
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
    setForm({ descripcion: row.descripcion, monto: row.monto, categoria: row.categoria })
    setEditando(row.id)
    setModal(true)
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este gasto?')) return
    try {
      await deleteGasto(id)
      cargar()
    } catch (err) {
      alert(err.response?.data?.mensaje ?? 'Error al eliminar')
    }
  }

  const fmt = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

  const columns = [
    { key: 'id', label: '#', render: (v) => `#${v}` },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'categoria', label: 'Categoría' },
    {
      key: 'fecha', label: 'Fecha',
      render: (v) => new Date(v).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
    { key: 'monto', label: 'Monto', render: (v) => fmt(v) },
  ]

  return (
    <div>
      <PageHeader title="Gastos">
        <Button onClick={() => { setForm(inicial); setEditando(null); setModal(true) }}>
          + Registrar gasto
        </Button>
      </PageHeader>

      <DataTable columns={columns} data={gastos} onEdit={handleEditar} onDelete={handleEliminar} />

      {modal && (
        <Modal title={editando ? 'Editar gasto' : 'Registrar gasto'} onClose={() => setModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Descripción" name="descripcion" value={form.descripcion} onChange={handleChange} required />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Monto" name="monto" type="number" value={form.monto} onChange={handleChange} required />
              <FormField label="Categoría" name="categoria" value={form.categoria} onChange={handleChange} required />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
              <Button type="submit">{editando ? 'Guardar cambios' : 'Registrar gasto'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}