import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import { getAuditoria, getAuditoriaUsuario } from '../api/auditoria'
import { ScrollText } from 'lucide-react'

const ACCION_LABEL = {
  LOGIN: 'Inicio de sesión',
  LOGIN_FALLIDO: 'Intento fallido',
  USUARIO_CREAR: 'Usuario creado',
  USUARIO_ACTUALIZAR: 'Usuario modificado',
  USUARIO_ELIMINAR: 'Usuario eliminado',
}

const ACCION_COLOR = {
  LOGIN: 'bg-green-50 text-green-700',
  LOGIN_FALLIDO: 'bg-red-50 text-red-600',
  USUARIO_CREAR: 'bg-blue-50 text-blue-600',
  USUARIO_ACTUALIZAR: 'bg-amber-50 text-amber-700',
  USUARIO_ELIMINAR: 'bg-rose-50 text-rose-600',
}

export default function Auditoria() {
  const [registros, setRegistros] = useState([])
  const [filtro, setFiltro] = useState('')
  const [cargando, setCargando] = useState(true)

  const cargar = async (usuario = '') => {
    setCargando(true)
    try {
      const r = usuario ? await getAuditoriaUsuario(usuario) : await getAuditoria()
      setRegistros(r.data)
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    let activo = true
    getAuditoria()
      .then((r) => activo && setRegistros(r.data))
      .catch(console.error)
      .finally(() => activo && setCargando(false))
    return () => { activo = false }
  }, [])

  const buscar = (e) => {
    e.preventDefault()
    cargar(filtro.trim())
  }

  return (
    <div>
      <PageHeader title="Auditoría">
        <form onSubmit={buscar} className="flex gap-2">
          <input
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Filtrar por usuario"
            className="rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
          />
          <Button type="submit" variant="secondary">Buscar</Button>
          {filtro && (
            <Button type="button" variant="secondary" onClick={() => { setFiltro(''); cargar() }}>
              Limpiar
            </Button>
          )}
        </form>
      </PageHeader>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase">Fecha</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase">Usuario</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase">Acción</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cargando ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400 text-sm">Cargando…</td></tr>
              ) : registros.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-400 text-sm">
                    Sin registros de auditoría
                  </td>
                </tr>
              ) : (
                registros.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap text-gray-500 tabular-nums">{r.fecha}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-800">{r.usuario}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${ACCION_COLOR[r.accion] ?? 'bg-gray-50 text-gray-600'}`}>
                        <ScrollText size={12} />
                        {ACCION_LABEL[r.accion] ?? r.accion}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{r.detalle}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}