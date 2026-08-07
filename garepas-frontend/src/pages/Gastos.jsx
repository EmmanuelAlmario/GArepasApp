import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Button from '../components/Button'
import FormField from '../components/FormField'
import ConfirmDialog from '../components/ConfirmDialog'
import { getGastos, createGasto, updateGasto, deleteGasto } from '../api/gastos'
import { CATEGORIAS_GASTO } from '../constants/categoriasGasto'
import { downloadCSV, fechaCSV } from '../utils/export'
import toast from 'react-hot-toast'

const inicial = { descripcion: '', monto: '', categoria: '' }

export default function Gastos({ embedded = false }) {
  const [gastos, setGastos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(inicial)
  const [editando, setEditando] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  const cargar = () =>
    getGastos()
      .then((r) => setGastos(r.data))
      .catch(console.error)
      .finally(() => setCargando(false))

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
      toast.error(err.response?.data?.mensaje ?? 'Error al guardar')
    }
  }

  const handleEditar = (row) => {
    setForm({ descripcion: row.descripcion, monto: row.monto, categoria: row.categoria })
    setEditando(row.id)
    setModal(true)
  }

  const handleEliminar = async (id) => {
    try {
      await deleteGasto(id)
      cargar()
      toast.success('Gasto eliminado.')
    } catch (err) {
      toast.error(err.response?.data?.mensaje ?? 'Error al eliminar')
    } finally {
      setConfirmId(null)
    }
  }

  const fmt = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

  const exportarCSV = () =>
    downloadCSV('gastos', [
      { label: 'No.', get: (v) => `#${v.id}` },
      { label: 'Descripción', key: 'descripcion' },
      { label: 'Categoría', key: 'categoria' },
      { label: 'Fecha', get: (v) => fechaCSV(v.fecha) },
      { label: 'Monto', get: (v) => Number(v.monto) },
    ], gastos)

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

  const gastosFiltrados = busqueda.trim()
    ? gastos.filter((g) =>
        g.descripcion.toLowerCase().includes(busqueda.trim().toLowerCase()) ||
        (g.categoria || '').toLowerCase().includes(busqueda.trim().toLowerCase()))
    : gastos

  return (
    <div>
      {!embedded && (
        <PageHeader title="Gastos">
          <Button variant="secondary" onClick={exportarCSV} disabled={gastos.length === 0}>
            Descargar CSV
          </Button>
          <Button onClick={() => { setForm(inicial); setEditando(null); setModal(true) }}>
            + Registrar gasto
          </Button>
        </PageHeader>
      )}
      {embedded && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => { setForm(inicial); setEditando(null); setModal(true) }}>
            + Registrar gasto
          </Button>
        </div>
      )}

      <div className="relative mb-4">
        <Search size={17} className="absolute top-1/2 -translate-y-1/2 left-3 text-[var(--muted)]" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar gasto por descripción o categoría…"
          aria-label="Buscar gasto"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none focus:ring-2 focus:ring-[var(--brand-orange)]/30"
          style={{ background: 'var(--panel-2)', color: 'var(--ink)' }}
        />
      </div>

      <DataTable columns={columns} data={gastosFiltrados} onEdit={handleEditar} onDelete={setConfirmId} loading={cargando} />

      {modal && (
        <Modal title={editando ? 'Editar gasto' : 'Registrar gasto'} onClose={() => setModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Descripción" name="descripcion" value={form.descripcion} onChange={handleChange} required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Monto" name="monto" type="number" value={form.monto} onChange={handleChange} required />
              <FormField label="Categoría" name="categoria" type="select" value={form.categoria} onChange={handleChange} options={CATEGORIAS_GASTO} required />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
              <Button type="submit">{editando ? 'Guardar cambios' : 'Registrar gasto'}</Button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog
        open={!!confirmId}
        title="Eliminar gasto"
        message="¿Eliminar este gasto? Esta acción no se puede deshacer."
        onConfirm={() => handleEliminar(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}
