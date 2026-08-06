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

  const cargar = () => getEmpleados().then((r) => setEmpleados(r.data)).catch(console.error)

  useEffect(() => { cargar() }, [])

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

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase">Nombre</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase">Estado</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase">Precio/día</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase">Días trabajados</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase">Días pagados</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase">Días debidos</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase">Deuda total</th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {empleados.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                  No hay empleados registrados
                </td>
              </tr>
            ) : (
              empleados.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-800">{emp.nombre}</td>
                  <td className="px-5 py-3.5"><StatusBadge activo={emp.activo} /></td>
                  <td className="px-5 py-3.5 text-gray-700">{fmt(emp.precioDia)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuitarDia(emp)}
                        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 font-bold text-sm flex items-center justify-center transition-colors"
                      >
                        −
                      </button>
                      <span className="font-semibold text-gray-800 w-6 text-center">{emp.diasTrabajados}</span>
                      <button
                        onClick={() => handleAgregarDia(emp)}
                        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-green-100 text-gray-500 hover:text-green-600 font-bold text-sm flex items-center justify-center transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-700">{emp.diasPagados}</td>
                  <td className="px-5 py-3.5">
                    <span className={`font-semibold ${emp.diasDebidos > 0 ? 'text-red-500' : 'text-green-600'}`}>
                      {emp.diasDebidos}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-gray-800">{fmt(emp.deudaTotal)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditar(emp)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => abrirPago(emp)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 font-medium transition-colors"
                        disabled={emp.diasDebidos === 0}
                      >
                        Pagar
                      </button>
                      <button
                        onClick={() => abrirHistorial(emp)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium transition-colors"
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
            <div className="bg-gray-50 rounded-lg px-4 py-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Días debidos</span>
                <span className="font-semibold text-gray-800">{seleccionado.diasDebidos} días</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Precio por día</span>
                <span className="font-semibold text-gray-800">{fmt(seleccionado.precioDia)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-200 pt-1 mt-1">
                <span className="text-gray-500">Deuda total</span>
                <span className="font-bold text-red-500">{fmt(seleccionado.deudaTotal)}</span>
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
              <div className="bg-green-50 rounded-lg px-4 py-2 flex justify-between text-sm">
                <span className="text-green-700">Monto a pagar</span>
                <span className="font-bold text-green-700">{fmt(Number(diasPago) * seleccionado.precioDia)}</span>
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
