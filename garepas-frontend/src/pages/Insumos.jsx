import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Button from '../components/Button'
import FormField from '../components/FormField'
import StatusBadge, { BadgePill } from '../components/StatusBadge'
import { getInsumos, createInsumo, updateInsumo, deleteInsumo, ajustarStock } from '../api/insumos'
import { aUnidadBase, unidadBase, fmtCantidad } from '../utils/unidades'
import toast from 'react-hot-toast'

const UNIDADES = ['GRAMO', 'KILOGRAMO', 'MILILITRO', 'LITRO', 'UNIDAD', 'CUCHARADA', 'TAZA'].map((u) => ({
  value: u,
  label: u,
}))

const inicial = {
  nombre: '',
  categoria: '',
  marca: '',
  stockActual: '',
  stockMinimo: '',
  precioCompra: '',
  unidadMedida: '',
  activo: true,
}

// Calcula precioPorGramo segun la unidad seleccionada
const calcularPrecioPorGramo = (precioCompra, unidad) => {
  const precio = Number(precioCompra)
  if (!precio || !unidad) return null
  switch (unidad) {
    case 'KILOGRAMO': return precio / 1000        
    case 'GRAMO':     return precio              
    case 'LITRO':     return precio / 1000        
    case 'MILILITRO': return precio            
    case 'CUCHARADA': return precio / 15         
    case 'TAZA':      return precio / 240        
    case 'UNIDAD':    return precio               
    default:          return precio
  }
}

const labelPrecioCompra = (unidad) => {
  switch (unidad) {
    case 'KILOGRAMO': return 'Precio de compra por KG'
    case 'GRAMO':     return 'Precio de compra por Gramo'
    case 'LITRO':     return 'Precio de compra por Litro'
    case 'MILILITRO': return 'Precio de compra por ml'
    case 'CUCHARADA': return 'Precio de compra por Cucharada'
    case 'TAZA':      return 'Precio de compra por Taza'
    case 'UNIDAD':    return 'Precio de compra por Unidad'
    default:          return 'Precio de compra'
  }
}

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 2 }).format(n)

const factorUnidad = (unidad) => {
  switch (unidad) {
    case 'KILOGRAMO': return 1000
    case 'GRAMO': return 1
    case 'LITRO': return 1000
    case 'MILILITRO': return 1
    case 'CUCHARADA': return 15
    case 'TAZA': return 240
    case 'UNIDAD': return 1
    default: return 1
  }
}

export default function Insumos({ embedded = false }) {
  const [insumos, setInsumos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(inicial)
  const [editando, setEditando] = useState(null)

  const cargar = () =>
    getInsumos()
      .then((r) => setInsumos(r.data))
      .catch(console.error)
      .finally(() => setCargando(false))

  useEffect(() => { cargar() }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const precioPorGramoCalculado = calcularPrecioPorGramo(form.precioCompra, form.unidadMedida)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      nombre: form.nombre,
      categoria: form.categoria,
      marca: form.marca,
      stockActual: aUnidadBase(Number(form.stockActual), form.unidadMedida),
      stockMinimo: form.stockMinimo !== '' && form.stockMinimo != null
        ? aUnidadBase(Number(form.stockMinimo), form.unidadMedida)
        : null,
      precioPorGramo: precioPorGramoCalculado,
      unidadMedida: unidadBase(form.unidadMedida),
      activo: form.activo,
    }
    try {
      if (editando) {
        await updateInsumo(editando, payload)
      } else {
        await createInsumo(payload)
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
    const unidad = row.unidadMedida
    const precioCompraEstimado = Number(row.precioPorGramo) * factorUnidad(unidad)
    setForm({
      ...row,
      precioCompra: Number.isFinite(precioCompraEstimado) ? precioCompraEstimado : row.precioPorGramo,
    })
    setEditando(row.id)
    setModal(true)
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este insumo?')) return
    try {
      await deleteInsumo(id)
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.mensaje ?? 'Error al eliminar')
    }
  }

  // --- Ajuste múltiple de stock (reducción) ---
  const [modalAjuste, setModalAjuste] = useState(false)
  const [filasAjuste, setFilasAjuste] = useState([{ insumoId: '', cantidad: '' }])
  const [enviandoAjuste, setEnviandoAjuste] = useState(false)

  const abrirAjuste = () => {
    setFilasAjuste([{ insumoId: '', cantidad: '' }])
    setModalAjuste(true)
  }

  const insumoSeleccionado = (id) => insumos.find((i) => String(i.id) === String(id))

  const cambiarFila = (idx, campo, valor) => {
    setFilasAjuste((f) => f.map((fila, i) => (i === idx ? { ...fila, [campo]: valor } : fila)))
  }

  const agregarFila = () => {
    setFilasAjuste((f) => [...f, { insumoId: '', cantidad: '' }])
  }

  const quitarFila = (idx) => {
    setFilasAjuste((f) => f.filter((_, i) => i !== idx))
  }

  // Opciones de insumos disponibles para una fila (excluye los ya elegidos en otras filas)
  const opcionesParaFila = (idx) =>
    insumos
      .filter((i) => i.activo)
      .filter((i) => String(i.id) === String(filasAjuste[idx].insumoId) || !filasAjuste.some((f, j) => j !== idx && String(f.insumoId) === String(i.id)))
      .map((i) => ({ value: i.id, label: `${i.nombre} (${fmtCantidad(i.stockActual, i.unidadMedida)})` }))

  const filasValidas = filasAjuste.filter((f) => f.insumoId && Number(f.cantidad) > 0)

  const handleSubmitAjuste = async (e) => {
    e.preventDefault()
    const payload = {
      detalles: filasValidas.map((f) => ({
        insumoId: Number(f.insumoId),
        cantidad: aUnidadBase(Number(f.cantidad), insumoSeleccionado(f.insumoId)?.unidadMedida),
      })),
    }
    if (payload.detalles.length === 0) {
      toast.error('Agrega al menos un insumo con cantidad mayor a cero.')
      return
    }
    setEnviandoAjuste(true)
    try {
      const { data } = await ajustarStock(payload)
      setModalAjuste(false)
      cargar()
      toast.success(`Stock actualizado para ${data.cantidadInsumosAjustados} insumo(s).`)
    } catch (err) {
      toast.error(err.response?.data?.mensaje ?? 'Error al ajustar stock')
    } finally {
      setEnviandoAjuste(false)
    }
  }

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'categoria', label: 'Categoría' },
    { key: 'marca', label: 'Marca' },
    {
      key: 'stockActual', label: 'Stock',
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <span>{fmtCantidad(v, row.unidadMedida)}</span>
          {row.stockBajo && (
            <BadgePill tone="red">Bajo</BadgePill>
          )}
        </div>
      ),
    },
    {
      key: 'precioPorGramo', label: 'Precio/g o ml',
      render: (v) => fmt(v),
    },
    { key: 'activo', label: 'Estado', render: (v) => <StatusBadge activo={v} /> },
  ]

  return (
    <div>
      {!embedded && (
        <PageHeader title="Insumos">
          <div className="flex gap-2">
            <Button variant="secondary" onClick={abrirAjuste}>
              − Reducir stock
            </Button>
            <Button onClick={() => { setForm(inicial); setEditando(null); setModal(true) }}>
              + Agregar insumo
            </Button>
          </div>
        </PageHeader>
      )}
      {embedded && (
        <div className="flex justify-end gap-2 mb-4">
          <Button variant="secondary" onClick={abrirAjuste}>
            − Reducir stock
          </Button>
          <Button onClick={() => { setForm(inicial); setEditando(null); setModal(true) }}>
            + Agregar insumo
          </Button>
        </div>
      )}

      <DataTable columns={columns} data={insumos} onEdit={handleEditar} onDelete={handleEliminar} loading={cargando} />

      {modal && (
        <Modal title={editando ? 'Editar insumo' : 'Agregar insumo'} onClose={() => setModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
            <FormField label="Categoría" name="categoria" value={form.categoria} onChange={handleChange} required />
            <FormField label="Marca" name="marca" value={form.marca} onChange={handleChange} required />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                label="Stock actual"
                name="stockActual"
                type="number"
                value={form.stockActual}
                onChange={handleChange}
                required
              />
              <FormField
                label="Unidad de medida"
                name="unidadMedida"
                type="select"
                value={form.unidadMedida}
                onChange={handleChange}
                options={UNIDADES}
                required
              />
            </div>

            <FormField
              label="Stock mínimo (alerta)"
              name="stockMinimo"
              type="number"
              value={form.stockMinimo ?? ''}
              onChange={handleChange}
              placeholder="Opcional: avisa cuando el stock baje de aquí"
            />

            {form.unidadMedida && form.stockActual && form.unidadMedida !== unidadBase(form.unidadMedida) && (
              <p className="text-xs text-gray-400 -mt-2">
                Se guardará como{' '}
                <span className="font-semibold">
                  {fmtCantidad(aUnidadBase(Number(form.stockActual), form.unidadMedida), unidadBase(form.unidadMedida))}
                </span>
              </p>
            )}

            <FormField
              label={form.unidadMedida ? labelPrecioCompra(form.unidadMedida) : 'Precio de compra'}
              name="precioCompra"
              type="number"
              value={form.precioCompra}
              onChange={handleChange}
              required
            />

            {precioPorGramoCalculado !== null && form.unidadMedida !== 'GRAMO' && form.unidadMedida !== 'MILILITRO' && form.unidadMedida !== 'UNIDAD' && (
              <div className="bg-blue-50 rounded-lg px-4 py-2.5 flex justify-between items-center -mt-2">
                <span className="text-xs text-blue-600 font-medium">
                  Precio por {unidadBase(form.unidadMedida) === 'GRAMO' ? 'gramo' : 'ml'} calculado
                </span>
                <span className="text-sm font-bold text-blue-700">
                  {fmt(precioPorGramoCalculado)}
                </span>
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} className="rounded" />
              Activo
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
              <Button type="submit" disabled={!precioPorGramoCalculado}>
                {editando ? 'Guardar cambios' : 'Crear insumo'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {modalAjuste && (
        <Modal title="Reducir stock de insumos" onClose={() => setModalAjuste(false)}>
          <form onSubmit={handleSubmitAjuste} className="space-y-4">
            <p className="text-xs text-gray-400">
              Registra el insumo (o insumos) que se gastó y la cantidad. El stock se descontará
              automáticamente para todos al enviar.
            </p>

            <div className="space-y-3">
              {filasAjuste.map((fila, idx) => {
                const ins = insumoSeleccionado(fila.insumoId)
                const cantidad = Number(fila.cantidad)
                const cantidadBase = ins ? aUnidadBase(cantidad, ins.unidadMedida) : 0
                const stockBase = ins ? Number(ins.stockActual) : 0
                const quedaría = ins ? stockBase - cantidadBase : null
                const excede = quedaría !== null && quedaría < 0
                return (
                  <div key={idx} className="rounded-lg border border-[#f2e0b2] p-3 bg-[#fffbe9]">
                    <div className="grid grid-cols-2 sm:grid-cols-12 gap-2 items-end">
                      <div className="col-span-2 sm:col-span-8">
                        <FormField
                          label={idx === 0 ? 'Insumo' : ''}
                          name={`insumo-${idx}`}
                          type="select"
                          value={fila.insumoId}
                          onChange={(e) => cambiarFila(idx, 'insumoId', e.target.value)}
                          options={opcionesParaFila(idx)}
                          required={false}
                        />
                      </div>
                      <div className="col-span-1 sm:col-span-3">
                        <FormField
                          label={idx === 0 ? 'Cant.' : ''}
                          name={`cantidad-${idx}`}
                          type="number"
                          value={fila.cantidad}
                          onChange={(e) => cambiarFila(idx, 'cantidad', e.target.value)}
                          required={false}
                        />
                      </div>
                      <div className="col-span-1 sm:col-span-1 flex justify-end">
                        {filasAjuste.length > 1 && (
                          <button
                            type="button"
                            onClick={() => quitarFila(idx)}
                            className="text-xs px-2.5 py-2 rounded-lg bg-[#fde7e4] text-[var(--brand-danger)] hover:bg-[#fbd4ce] font-bold transition-colors"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                    {ins && cantidad > 0 && (
                      <p className={`text-xs mt-1.5 ${excede ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                        Stock actual: {fmtCantidad(ins.stockActual, ins.unidadMedida)} · Quedaría: {fmtCantidad(quedaría, unidadBase(ins.unidadMedida))}
                        {excede && ' (insuficiente)'}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            <button
              type="button"
              onClick={agregarFila}
              className="text-sm font-bold text-[var(--brand-red)] hover:underline"
            >
              + Agregar otro insumo
            </button>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setModalAjuste(false)}>Cancelar</Button>
              <Button type="submit" variant="danger" disabled={enviandoAjuste || filasValidas.length === 0}>
                {enviandoAjuste ? 'Aplicando...' : `Descontar ${filasValidas.length} insumo(s)`}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
