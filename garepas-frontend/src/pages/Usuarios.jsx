import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import Button from '../components/Button'
import FormField from '../components/FormField'
import StatusBadge from '../components/StatusBadge'
import ConfirmDialog from '../components/ConfirmDialog'
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
  const [cargando, setCargando] = useState(true)
  const [confirmar, setConfirmar] = useState(null)

  const cargar = () => getUsuarios().then((r) => setUsuarios(r.data)).catch(console.error)

  useEffect(() => {
    let activo = true
    getUsuarios()
      .then((r) => activo && setUsuarios(r.data))
      .catch(console.error)
      .finally(() => activo && setCargando(false))
    return () => { activo = false }
  }, [])

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

  const handleEliminar = async (id) => {
    try {
      await deleteUsuario(id)
      cargar()
      toast.success('Usuario eliminado.')
    } catch (err) {
      toast.error(err.response?.data?.mensaje ?? 'No se pudo eliminar')
    } finally {
      setConfirmar(null)
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

      <div className="rounded-xl border border-[var(--border)] shadow-sm overflow-hidden" style={{ background: 'var(--panel)' }}>
        {cargando ? (
          <div className="p-8 space-y-3">
            {[0, 1, 2].map((i) => <div key={i} className="skeleton h-6 w-full" />)}
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--muted)] uppercase">Usuario</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--muted)] uppercase">Rol</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--muted)] uppercase">Estado</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-[var(--muted)] uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-[var(--muted)] text-sm">
                    No hay usuarios registrados
                  </td>
                </tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-[var(--panel-2)] transition-colors">
                    <td className="px-5 py-3.5 font-medium text-[var(--ink)]">{u.username}</td>
                    <td className="px-5 py-3.5 text-[var(--ink-soft)]">{ROL_LABEL[u.rol] ?? u.rol}</td>
                    <td className="px-5 py-3.5"><StatusBadge activo={u.activo} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditar(u)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-[#ffeec2] text-[var(--brand-ink)] hover:bg-[#ffe5a6] font-medium transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setConfirmar(u)}
                          disabled={u.username === 'admin'}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                            u.username === 'admin'
                              ? 'bg-[var(--panel-2)] text-[var(--muted)] cursor-not-allowed'
                              : 'bg-[#fde7e4] text-[var(--brand-danger)] hover:bg-[#fbd4ce]'
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
        )}
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
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">Rol</label>
              <select
                name="rol"
                value={form.rol}
                onChange={handleChange}
                className="w-full rounded-lg border border-[var(--border)] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-orange)]/30"
                style={{ background: 'var(--panel-2)', color: 'var(--ink)' }}
              >
                <option value="VENTAS">Registrador de ventas</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-[var(--ink-soft)] cursor-pointer">
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

      <ConfirmDialog
        open={!!confirmar}
        title="Eliminar usuario"
        message={`¿Eliminar el usuario "${confirmar?.username}"? Esta acción no se puede deshacer.`}
        onConfirm={() => handleEliminar(confirmar.id)}
        onCancel={() => setConfirmar(null)}
      />
    </div>
  )
}