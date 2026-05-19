import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Button from '../components/Button'
import FormField from '../components/FormField'
import { getRecetas, createReceta, updateReceta, deleteReceta } from '../api/recetas'
import { getInsumos } from '../api/insumos'
import { aUnidadBase, unidadBase } from '../utils/unidades'

const UNIDADES = ['GRAMO', 'KILOGRAMO', 'MILILITRO', 'LITRO', 'UNIDAD', 'CUCHARADA', 'TAZA'].map((u) => ({
  value: u, label: u,
}))

const detalleInicial = { insumoId: '', cantidad: '', unidadMedida: '' }
const inicial = { nombre: '', descripcion: '', detalles: [{ ...detalleInicial }] }

export default function Recetas() {
  const [recetas, setRecetas] = useState([])
  const [insumos, setInsumos] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(inicial)
  const [editando, setEditando] = useState(null)

  const cargar = () => getRecetas().then((r) => setRecetas(r.data)).catch(console.error)

  useEffect(() => {
    cargar()
    getInsumos().then((r) => setInsumos(r.data)).catch(console.error)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleDetalleChange = (i, e) => {
    const { name, value } = e.target
    setForm((f) => {
      const detalles = [...f.detalles]
      detalles[i] = { ...detalles[i], [name]: value }
      return { ...f, detalles }
    })
  }

  const agregarDetalle = () =>
    setForm((f) => ({ ...f, detalles: [...f.detalles, { ...detalleInicial }] }))

  const quitarDetalle = (i) =>
    setForm((f) => ({ ...f, detalles: f.detalles.filter((_, idx) => idx !== i) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      detalles: form.detalles.map((d) => ({
        insumoId: Number(d.insumoId),
        cantidad: aUnidadBase(Number(d.cantidad), d.unidadMedida),
        unidadMedida: unidadBase(d.unidadMedida),
      })),
    }
    try {
      if (editando) {
        await updateReceta(editando, payload)
      } else {
        await createReceta(payload)
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
      nombre: row.nombre,
      descripcion: row.descripcion ?? '',
      detalles: row.detalles?.map((d) => ({
        insumoId: d.insumoId,
        cantidad: d.cantidad,
        unidadMedida: d.unidadMedida,
      })) ?? [{ ...detalleInicial }],
    })
    setEditando(row.id)
    setModal(true)
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar esta receta?')) return
    try {
      await deleteReceta(id)
      cargar()
    } catch (err) {
      alert(err.response?.data?.mensaje ?? 'Error al eliminar')
    }
  }

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
    {
      key: 'detalles', label: 'Insumos',
      render: (v) => `${v?.length ?? 0} insumo(s)`,
    },
  ]

  const insumoOpts = insumos.map((i) => ({ value: i.id, label: i.nombre }))

  return (
    <div>
      <PageHeader title="Recetas">
        <Button onClick={() => { setForm(inicial); setEditando(null); setModal(true) }}>
          + Agregar receta
        </Button>
      </PageHeader>

      <DataTable columns={columns} data={recetas} onEdit={handleEditar} onDelete={handleEliminar} />

      {modal && (
        <Modal title={editando ? 'Editar receta' : 'Agregar receta'} onClose={() => setModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
            <FormField label="Descripción" name="descripcion" value={form.descripcion} onChange={handleChange} />

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Insumos</label>
                <button type="button" onClick={agregarDetalle} className="text-xs text-blue-600 hover:underline font-medium">
                  + Agregar insumo
                </button>
              </div>
              <div className="space-y-2">
                {form.detalles.map((d, i) => (
                  <div key={i} className="space-y-1">
                    <div className="grid grid-cols-[1fr_80px_100px_32px] gap-2 items-end">
                      <FormField
                        label={i === 0 ? 'Insumo' : ''}
                        name="insumoId"
                        type="select"
                        value={d.insumoId}
                        onChange={(e) => handleDetalleChange(i, e)}
                        options={insumoOpts}
                        required
                      />
                      <FormField
                        label={i === 0 ? 'Cantidad' : ''}
                        name="cantidad"
                        type="number"
                        value={d.cantidad}
                        onChange={(e) => handleDetalleChange(i, e)}
                        required
                      />
                      <FormField
                        label={i === 0 ? 'Unidad' : ''}
                        name="unidadMedida"
                        type="select"
                        value={d.unidadMedida}
                        onChange={(e) => handleDetalleChange(i, e)}
                        options={UNIDADES}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => quitarDetalle(i)}
                        className="text-red-400 hover:text-red-600 text-lg pb-1"
                      >
                        ×
                      </button>
                    </div>
                    {d.cantidad && d.unidadMedida && d.unidadMedida !== unidadBase(d.unidadMedida) && (
                      <p className="text-xs text-gray-400 pl-1">
                        → {aUnidadBase(Number(d.cantidad), d.unidadMedida)} {unidadBase(d.unidadMedida)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
              <Button type="submit">{editando ? 'Guardar cambios' : 'Crear receta'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}