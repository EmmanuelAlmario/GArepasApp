import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import Button from '../components/Button'
import FormField from '../components/FormField'
import StatusBadge from '../components/StatusBadge'
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
} from '../api/usuarios'
import toast from 'react-hot-toast'

const ROL_LABEL = { ADMIN: 'Administrador', VENTAS: 'Registrador de ventas' }

const inicialForm = { username: '', password: '', rol: 'VENTAS', activo: true }

export default function Usuarios({ embedded = false }) {
  const [usuarios, setUsuarios] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(inicialForm)
  const [editando, setEditando] = useState(null)

  const cargar = () => getUsuarios().then((r) => setUsuarios(r.data)).catch(console.error)

  useEffect(() => { cargar() }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...form }
    if (editando) {
      if (!form.password) delete payload.password
      try {
        await updateUsuario(editando, payload)
      } catch (err) {
        toast.error(err.response?.data?.mensaje ?? 'Error al guardar')
        return
      }
    } else {
      if (!form.password) {
        toast.error('La contraseña es obligatoria')
        return
      }
      try {
        await createUsuario(payload)
      } catch (err) {
        toast.error(err.response?.data?.mensaje ?? 'Error al crear')
        return
      }
    }
    setModal(false)
    setForm(inicialForm)
    setEditando(null)
    cargar()
    toast.success(editando ? 'Usuario actualizado.' : 'Usuario creado.')
  }

  const handleEditar = (u) => {
    setForm({ username: u.username, password: '', rol: u.rol, activo: u.activo })
    setEditando(u.id)
    setModal(true)
  }

  const handleEliminar = async (u) => {
    if (!window.confirm(`¿Eliminar el usuario "${u.username}"?`)) return
    try {
      await deleteUsuario(u.id)
      cargar()
      toast.success('Usuario eliminado.')
    } catch (err) {
      toast.error(err.response?.data?.mensaje ?? 'No se pudo eliminar')
    }
  }

  return (
    <div>
      {!embedded && (
        <PageHeader title="Usuarios">
          <Button onClick={() => { setForm(inicialForm); setEditando(null); setModal(true) }}>
            + Crear usuario
          </Button>
        </PageHeader>
      )}
      {embedded && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => { setForm(inicialForm); setEditando(null); setModal(true) }}>
            + Crear usuario
          </Button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase">Usuario</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase">Rol</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase">Estado</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-400 text-sm">
                    No hay usuarios registrados
                  </td>
                </tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-800">{u.username}</td>
                    <td className="px-5 py-3.5 text-gray-700">{ROL_LABEL[u.rol] ?? u.rol}</td>
                    <td className="px-5 py-3.5"><StatusBadge activo={u.activo} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditar(u)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminar(u)}
                          disabled={u.username === 'admin'}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                            u.username === 'admin'
                              ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                              : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                        >
                          Eliminar
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

      {modal && (
        <Modal title={editando ? 'Editar usuario' : 'Crear usuario'} onClose={() => setModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Usuario" name="username" value={form.username} onChange={handleChange} required autoComplete="off" />
            <FormField
              label={editando ? 'Nueva contraseña (vacía = no cambiar)' : 'Contraseña'}
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required={!editando}
              minLength={6}
              autoComplete="new-password"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select
                name="rol"
                value={form.rol}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              >
                <option value="VENTAS">Registrador de ventas</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} className="rounded" />
              Activo
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
              <Button type="submit">{editando ? 'Guardar cambios' : 'Crear'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}