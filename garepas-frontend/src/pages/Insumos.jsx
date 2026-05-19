import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Button from '../components/Button'
import FormField from '../components/FormField'
import StatusBadge from '../components/StatusBadge'
import { getInsumos, createInsumo, updateInsumo, deleteInsumo } from '../api/insumos'
import { aUnidadBase, unidadBase } from '../utils/unidades'

const UNIDADES = ['GRAMO', 'KILOGRAMO', 'MILILITRO', 'LITRO', 'UNIDAD', 'CUCHARADA', 'TAZA'].map((u) => ({
  value: u,
  label: u,
}))

const inicial = {
  nombre: '',
  categoria: '',
  marca: '',
  stockActual: '',
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

export default function Insumos() {
  const [insumos, setInsumos] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(inicial)
  const [editando, setEditando] = useState(null)

  const cargar = () => getInsumos().then((r) => setInsumos(r.data)).catch(console.error)

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
      alert(err.response?.data?.mensaje ?? 'Error al guardar')
    }
  }

  const handleEditar = (row) => {
  
    setForm({
      ...row,
      precioCompra: row.precioPorGramo,
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
      alert(err.response?.data?.mensaje ?? 'Error al eliminar')
    }
  }

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'categoria', label: 'Categoría' },
    { key: 'marca', label: 'Marca' },
    {
      key: 'stockActual', label: 'Stock',
      render: (v, row) => `${v} ${row.unidadMedida}`,
    },
    {
      key: 'precioPorGramo', label: 'Precio/g o ml',
      render: (v) => fmt(v),
    },
    { key: 'activo', label: 'Estado', render: (v) => <StatusBadge activo={v} /> },
  ]

  return (
    <div>
      <PageHeader title="Insumos">
        <Button onClick={() => { setForm(inicial); setEditando(null); setModal(true) }}>
          + Agregar insumo
        </Button>
      </PageHeader>

      <DataTable columns={columns} data={insumos} onEdit={handleEditar} onDelete={handleEliminar} />

      {modal && (
        <Modal title={editando ? 'Editar insumo' : 'Agregar insumo'} onClose={() => setModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
            <FormField label="Categoría" name="categoria" value={form.categoria} onChange={handleChange} required />
            <FormField label="Marca" name="marca" value={form.marca} onChange={handleChange} required />

            <div className="grid grid-cols-2 gap-3">
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

            {form.unidadMedida && form.stockActual && form.unidadMedida !== unidadBase(form.unidadMedida) && (
              <p className="text-xs text-gray-400 -mt-2">
                Se guardará como{' '}
                <span className="font-semibold">
                  {aUnidadBase(Number(form.stockActual), form.unidadMedida)} {unidadBase(form.unidadMedida)}
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
    </div>
  )
}