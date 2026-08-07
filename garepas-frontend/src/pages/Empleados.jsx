import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Button from '../components/Button'
import FormField from '../components/FormField'
import StatusBadge from '../components/StatusBadge'
import {
  getEmpleados,
  createEmpleado,
  updateEmpleado,
  agregarDias,
  quitarDias,
  registrarPago,
  getHistorial,
} from '../api/empleados'
import { downloadCSV } from '../utils/export'
import toast from 'react-hot-toast'

const inicialForm = { nombre: '', precioDia: '', activo: true }

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function Empleados({ embedded = false }) {
  const [empleados, setEmpleados] = useState([])
  const [modalEmpleado, setModalEmpleado] = useState(false)
  const [modalPago, setModalPago] = useState(false)
  const [modalHistorial, setModalHistorial] = useState(false)
  const [form, setForm] = useState(inicialForm)
  const [editando, setEditando] = useState(null)
  const [seleccionado, setSeleccionado] = useState(null)
  const [historial, setHistorial] = useState([])
  const [diasPago, setDiasPago] = useState('')
  const [cargando, setCargando] = useState(true)

  const cargar = () => getEmpleados().then((r) => setEmpleados(r.data)).catch(console.error)

  useEffect(() => {
    let activo = true
    getEmpleados()
      .then((r) => activo && setEmpleados(r.data))
      .catch(console.error)
      .finally(() => activo && setCargando(false))
    return () => { activo = false }
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmitEmpleado = async (e) => {
    e.preventDefault()
    const payload = { ...form, precioDia: Number(form.precioDia) }
    try {
      if (editando) {
        await updateEmpleado(editando, payload)
      } else {
        await createEmpleado(payload)
      }
      setModalEmpleado(false)
      setForm(inicialForm)
      setEditando(null)
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.mensaje ?? 'Error al guardar')
    }
  }

  const handleEditar = (emp) => {
    setForm({ nombre: emp.nombre, precioDia: emp.precioDia, activo: emp.activo })
    setEditando(emp.id)
    setModalEmpleado(true)
  }

  const handleAgregarDia = async (emp) => {
    try {
      await agregarDias(emp.id, 1)
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.mensaje ?? 'Error')
    }
  }

  const handleQuitarDia = async (emp) => {
    try {
      await quitarDias(emp.id, 1)
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.mensaje ?? 'Error')
    }
  }

  const abrirPago = (emp) => {
    setSeleccionado(emp)
    setDiasPago('')
    setModalPago(true)
  }

  const handlePago = async (e) => {
    e.preventDefault()
    try {
      await registrarPago({ empleadoId: seleccionado.id, diasPagados: Number(diasPago) })
      setModalPago(false)
      cargar()
      toast.success('Pago registrado.')
    } catch (err) {
      toast.error(err.response?.data?.mensaje ?? 'Error al registrar pago')
    }
  }

  const abrirHistorial = async (emp) => {
    setSeleccionado(emp)
    try {
      const r = await getHistorial(emp.id)
      setHistorial(r.data)
      setModalHistorial(true)
    } catch (err) {
      toast.error(err.response?.data?.mensaje ?? 'No se pudo cargar el historial')
    }
  }

  const columnsHistorial = [
    {
      key: 'fecha', label: 'Fecha',
      render: (v) => new Date(v).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
    { key: 'diasPagados', label: 'Días pagados' },
    {
      key: 'diasPagados', label: 'Monto pagado',
      render: (v) => seleccionado ? fmt(v * seleccionado.precioDia) : '—',
    },
  ]

  const exportarCSV = () =>
    downloadCSV('empleados', [
      { label: 'Nombre', key: 'nombre' },
      { label: 'Precio/día', get: (v) => Number(v.precioDia) },
      { label: 'Días trabajados', key: 'diasTrabajados' },
      { label: 'Estado', get: (v) => (v.activo ? 'Activo' : 'Inactivo') },
    ], empleados)

  return (
    <div>
      {!embedded && (
        <PageHeader title="Empleados">
          <Button variant="secondary" onClick={exportarCSV} disabled={empleados.length === 0}>
            Descargar CSV
          </Button>
          <Button onClick={() => { setForm(inicialForm); setEditando(null); setModalEmpleado(true) }}>
            + Registrar empleado
          </Button>
        </PageHeader>
      )}
      {embedded && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => { setForm(inicialForm); setEditando(null); setModalEmpleado(true) }}>
            + Registrar empleado
          </Button>
        </div>
      )}

      {cargando ? (
        <div className="rounded-xl border border-[var(--border)] shadow-sm overflow-hidden p-8 space-y-3" style={{ background: 'var(--panel)' }}>
          {[0, 1, 2].map((i) => <div key={i} className="skeleton h-6 w-full" />)}
        </div>
      ) : (
      <div className="rounded-xl border border-[var(--border)] shadow-sm overflow-hidden" style={{ background: 'var(--panel)' }}>
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--muted)] uppercase">Nombre</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--muted)] uppercase">Estado</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--muted)] uppercase">Precio/día</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--muted)] uppercase">Días trabajados</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--muted)] uppercase">Días pagados</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--muted)] uppercase">Días debidos</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--muted)] uppercase">Deuda total</th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-[var(--muted)] uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {empleados.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-[var(--muted)] text-sm">
                  No hay empleados registrados
                </td>
              </tr>
            ) : (
              empleados.map((emp) => (
                <tr key={emp.id} className="hover:bg-[var(--panel-2)] transition-colors">
                  <td className="px-5 py-3.5 font-medium text-[var(--ink)]">{emp.nombre}</td>
                  <td className="px-5 py-3.5"><StatusBadge activo={emp.activo} /></td>
                  <td className="px-5 py-3.5 text-[var(--ink-soft)]">{fmt(emp.precioDia)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuitarDia(emp)}
                        aria-label={`Quitar un día a ${emp.nombre}`}
                        className="w-6 h-6 rounded-full bg-[var(--panel-2)] hover:bg-[#fde7e4] text-[var(--muted)] hover:text-[var(--brand-danger)] font-bold text-sm flex items-center justify-center transition-colors"
                      >
                        −
                      </button>
                      <span className="font-semibold text-[var(--ink)] w-6 text-center">{emp.diasTrabajados}</span>
                      <button
                        onClick={() => handleAgregarDia(emp)}
                        aria-label={`Añadir un día a ${emp.nombre}`}
                        className="w-6 h-6 rounded-full bg-[var(--panel-2)] hover:bg-[#e7f3db] text-[var(--muted)] hover:text-[var(--brand-success)] font-bold text-sm flex items-center justify-center transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[var(--ink-soft)]">{emp.diasPagados}</td>
                  <td className="px-5 py-3.5">
                    <span className={`font-semibold ${emp.diasDebidos > 0 ? 'text-[var(--brand-danger)]' : 'text-[var(--brand-success)]'}`}>
                      {emp.diasDebidos}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-[var(--ink)]">{fmt(emp.deudaTotal)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditar(emp)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-[#ffeec2] text-[var(--brand-ink)] hover:bg-[#ffe5a6] font-medium transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => abrirPago(emp)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-[#e7f3db] text-[var(--brand-success)] hover:bg-[#d8ecc3] font-medium transition-colors"
                        disabled={emp.diasDebidos === 0}
                      >
                        Pagar
                      </button>
                      <button
                        onClick={() => abrirHistorial(emp)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-[var(--panel-2)] text-[var(--ink-soft)] border border-[var(--border)] font-medium transition-colors"
                      >
                        Historial
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
      )}

      {/* Modal empleado */}
      {modalEmpleado && (
        <Modal title={editando ? 'Editar empleado' : 'Registrar empleado'} onClose={() => setModalEmpleado(false)}>
          <form onSubmit={handleSubmitEmpleado} className="space-y-4">
            <FormField label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
            <FormField label="Precio por día" name="precioDia" type="number" value={form.precioDia} onChange={handleChange} required />
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} className="rounded" />
              Activo
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setModalEmpleado(false)}>Cancelar</Button>
              <Button type="submit">{editando ? 'Guardar cambios' : 'Registrar'}</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal pago */}
      {modalPago && seleccionado && (
        <Modal title={`Registrar pago — ${seleccionado.nombre}`} onClose={() => setModalPago(false)}>
          <form onSubmit={handlePago} className="space-y-4">
            <div className="rounded-lg px-4 py-3 space-y-1" style={{ background: 'var(--panel-2)' }}>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">Días debidos</span>
                <span className="font-semibold text-[var(--ink)]">{seleccionado.diasDebidos} días</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">Precio por día</span>
                <span className="font-semibold text-[var(--ink)]">{fmt(seleccionado.precioDia)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-[var(--border)] pt-1 mt-1">
                <span className="text-[var(--muted)]">Deuda total</span>
                <span className="font-bold text-[var(--brand-danger)]">{fmt(seleccionado.deudaTotal)}</span>
              </div>
            </div>

            <FormField
              label="Días a pagar"
              name="diasPago"
              type="number"
              value={diasPago}
              onChange={(e) => setDiasPago(e.target.value)}
              required
            />

            {diasPago && (
              <div className="rounded-lg px-4 py-2 flex justify-between text-sm" style={{ background: 'var(--panel-2)' }}>
                <span className="text-[var(--brand-success)]">Monto a pagar</span>
                <span className="font-bold text-[var(--brand-success)]">{fmt(Number(diasPago) * seleccionado.precioDia)}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setModalPago(false)}>Cancelar</Button>
              <Button type="submit" variant="success">Registrar pago</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal historial */}
      {modalHistorial && seleccionado && (
        <Modal title={`Historial — ${seleccionado.nombre}`} onClose={() => setModalHistorial(false)}>
          <DataTable columns={columnsHistorial} data={historial} />
        </Modal>
      )}
    </div>
  )
}
