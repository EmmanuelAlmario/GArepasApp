import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Button from '../components/Button'
import FormField from '../components/FormField'
import { getProducciones, createProduccion, verificarProduccion, deleteProduccion } from '../api/producciones'
import { getProductos } from '../api/productos'
import { fmtCantidad } from '../utils/unidades'
import toast from 'react-hot-toast'

const inicial = { productoId: '', cantidad: '' }
const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0)

export default function Producciones() {
  const [producciones, setProducciones] = useState([])
  const [productos, setProductos] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(inicial)
  const [verificandoId, setVerificandoId] = useState(null)
  const [faltantes, setFaltantes] = useState(null)

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
      const { data } = await createProduccion(payload)
      setModal(false)
      setForm(inicial)
      cargar()
      if (data.estado === 'PENDIENTE') {
        toast('Producción registrada con estado INSUFICIENTE. Re-verifica cuando haya stock.',
          { icon: '⚠️' })
      } else {
        toast.success('Producción completada correctamente.')
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje ?? 'Error al registrar producción')
    }
  }

  const handleVerificar = async (id) => {
    setVerificandoId(id)
    try {
      const { data } = await verificarProduccion(id)
      if (data.estado === 'COMPLETADA') {
        toast.success('Producción completada. Stock descontado y gasto registrado.')
      } else {
        toast('Aún hay insumos insuficientes.', { icon: '⚠️' })
      }
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.mensaje ?? 'Error al verificar producción')
    } finally {
      setVerificandoId(null)
    }
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar esta producción? Se revertirá el stock de insumos y producto si estaba completada.')) return
    try {
      await deleteProduccion(id)
      toast.success('Producción eliminada.')
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.mensaje ?? 'Error al eliminar')
    }
  }

  const columns = [
    { key: 'id', label: '#', render: (v) => `#${v}` },
    { key: 'productoNombre', label: 'Producto' },
    { key: 'cantidad', label: 'Cantidad' },
    { key: 'costoTotal', label: 'Costo total', render: (v) => fmt(v) },
    { key: 'costoUnitario', label: 'Costo unitario', render: (v) => fmt(v) },
    {
      key: 'estado', label: 'Estado',
      render: (v, row) => (
        <button
          onClick={() => v === 'PENDIENTE' && setFaltantes(row)}
          className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full transition-colors ${
            v === 'COMPLETADA'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer underline decoration-dotted underline-offset-2'
          }`}
          title={v === 'PENDIENTE' ? 'Ver insumos faltantes' : ''}
        >
          {v === 'COMPLETADA' ? 'SUFICIENTE' : 'INSUFICIENTE'}
        </button>
      ),
    },
    {
      key: 'detalles', label: 'Insumos OK',
      render: (v) => {
        const total = v?.length ?? 0
        const ok = v?.filter((d) => d.suficiente).length ?? 0
        return (
          <span className={`text-xs font-medium ${ok === total ? 'text-green-600' : 'text-red-600'}`}>
            {ok}/{total}
          </span>
        )
      },
    },
    {
      key: 'fecha', label: 'Fecha',
      render: (v) => new Date(v).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
    {
      key: 'acciones', label: 'Acciones',
      render: (_v, row) => (
        <div className="flex items-center justify-end gap-2">
          {row.estado === 'PENDIENTE' && (
            <button
              onClick={() => handleVerificar(row.id)}
              disabled={verificandoId === row.id}
              className="text-xs px-3 py-1.5 rounded-lg bg-[#ffeec2] text-[var(--brand-ink)] hover:bg-[#ffe5a6] font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verificandoId === row.id ? 'Verificando...' : 'Re-verificar'}
            </button>
          )}
          <button
            onClick={() => handleEliminar(row.id)}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#fde7e4] text-[var(--brand-danger)] hover:bg-[#fbd4ce] font-bold transition-colors"
          >
            Eliminar
          </button>
        </div>
      ),
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

      <DataTable columns={columns} data={producciones} />

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
              Solo aparecen productos con receta asignada. Si faltan insumos, la producción quedará
              en estado <span className="font-bold text-red-600">INSUFICIENTE</span> y podrás
              re-verificarla cuando el stock sea suficiente.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
              <Button type="submit" variant="success">Registrar producción</Button>
            </div>
          </form>
        </Modal>
      )}

      {faltantes && (
        <Modal
          title={`Insumos faltantes — Producción #${faltantes.id}`}
          onClose={() => setFaltantes(null)}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold">{faltantes.productoNombre}</span>
              <span className="text-[var(--brand-ink)]/50">·</span>
              <span>{faltantes.cantidad} unidades</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#f2e0b2]">
              <table className="w-full text-sm min-w-[440px]">
                <thead>
                  <tr className="border-b border-[#f2e0b2] bg-[#fff4d6]">
                    <th className="text-left px-4 py-2.5 text-xs font-bold text-[var(--brand-ink)]/70 uppercase tracking-wide">Insumo</th>
                    <th className="text-right px-4 py-2.5 text-xs font-bold text-[var(--brand-ink)]/70 uppercase tracking-wide">Requerido</th>
                    <th className="text-right px-4 py-2.5 text-xs font-bold text-[var(--brand-ink)]/70 uppercase tracking-wide">Disponible</th>
                    <th className="text-right px-4 py-2.5 text-xs font-bold text-[var(--brand-ink)]/70 uppercase tracking-wide">Faltante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f9eecf]">
                  {faltantes.detalles.map((d) => {
                    const requerido = Number(d.cantidadRequerida || 0)
                    const disponible = Number(d.stockDisponible ?? d.cantidadUsada ?? 0)
                    const faltante = Math.max(0, requerido - disponible)
                    return (
                      <tr
                        key={d.insumoId}
                        className={d.suficiente ? '' : 'bg-red-50'}
                      >
                        <td className="px-4 py-2.5 font-medium text-[var(--brand-ink)]">
                          {d.insumoNombre}
                          {!d.suficiente && (
                            <span className="ml-2 text-xs font-bold text-red-600">✗</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right">{fmtCantidad(requerido, d.insumoUnidadMedida)}</td>
                        <td className={`px-4 py-2.5 text-right ${d.suficiente ? 'text-green-600' : 'text-red-600 font-bold'}`}>
                          {fmtCantidad(disponible, d.insumoUnidadMedida)}
                        </td>
                        <td className={`px-4 py-2.5 text-right ${faltante > 0 ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                          {faltante > 0 ? fmtCantidad(faltante, d.insumoUnidadMedida) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-400">
              Repone el stock de los insumos marcados y pulsa <span className="font-bold">Re-verificar</span> en la tabla para completar la producción.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => { setFaltantes(null); handleVerificar(faltantes.id) }}
              >
                Re-verificar ahora
              </Button>
              <Button variant="secondary" onClick={() => setFaltantes(null)}>Cerrar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
