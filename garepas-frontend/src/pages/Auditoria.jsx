import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import Paginador from '../components/Paginador'
import { getAuditoriaPaginado, getAuditoriaUsuarioPaginado } from '../api/auditoria'
import { ScrollText } from 'lucide-react'

const PAGE_SIZE = 25

const ACCION_LABEL = {
  LOGIN: 'Inicio de sesión',
  LOGIN_FALLIDO: 'Intento fallido',
  USUARIO_CREAR: 'Usuario creado',
  USUARIO_ACTUALIZAR: 'Usuario modificado',
  USUARIO_ELIMINAR: 'Usuario eliminado',
}

const ACCION_COLOR = {
  LOGIN: 'bg-[#e7f3db] text-[var(--brand-success)]',
  LOGIN_FALLIDO: 'bg-[#fde7e4] text-[var(--brand-danger)]',
  USUARIO_CREAR: 'bg-[#ffeec2] text-[var(--brand-orange)]',
  USUARIO_ACTUALIZAR: 'bg-[#fff3d6] text-[var(--brand-orange)]',
  USUARIO_ELIMINAR: 'bg-[#fde7e4] text-[var(--brand-danger)]',
}

export default function Auditoria() {
  const [registros, setRegistros] = useState([])
  const [filtro, setFiltro] = useState('')
  const [cargando, setCargando] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const cargar = async (usuario, pagina) => {
    setCargando(true)
    try {
      const r = usuario
        ? await getAuditoriaUsuarioPaginado(usuario, pagina - 1, PAGE_SIZE)
        : await getAuditoriaPaginado(pagina - 1, PAGE_SIZE)
      setRegistros(r.data.content)
      setTotalPages(r.data.totalPages || 1)
      setTotal(r.data.totalElements ?? 0)
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    let activo = true
    getAuditoriaPaginado(0, PAGE_SIZE)
      .then((r) => activo && (setRegistros(r.data.content), setTotalPages(r.data.totalPages || 1), setTotal(r.data.totalElements ?? 0)))
      .catch(console.error)
      .finally(() => activo && setCargando(false))
    return () => { activo = false }
  }, [])

  const buscar = (e) => {
    e.preventDefault()
    setPage(1)
    cargar(filtro.trim(), 1)
  }

  const irA = (p) => {
    if (p < 1 || p > totalPages) return
    setPage(p)
    cargar(filtro.trim(), p)
  }

  return (
    <div>
      <PageHeader title="Auditoría">
        <form onSubmit={buscar} className="flex gap-2">
          <input
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Filtrar por usuario"
            className="rounded-lg border border-[var(--border)] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-orange)]/30"
            style={{ background: 'var(--panel-2)', color: 'var(--ink)' }}
          />
          <Button type="submit" variant="secondary">Buscar</Button>
          {filtro && (
            <Button type="button" variant="secondary" onClick={() => { setFiltro(''); setPage(1); cargar('', 1) }}>
              Limpiar
            </Button>
          )}
        </form>
      </PageHeader>

      <div className="rounded-xl border border-[var(--border)] shadow-sm overflow-hidden" style={{ background: 'var(--panel)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--muted)] uppercase">Fecha</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--muted)] uppercase">Usuario</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--muted)] uppercase">Acción</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--muted)] uppercase">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {cargando ? (
                <tr><td colSpan={4} className="text-center py-12 text-[var(--muted)] text-sm">Cargando…</td></tr>
              ) : registros.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-[var(--muted)] text-sm">
                    Sin registros de auditoría
                  </td>
                </tr>
              ) : (
                registros.map((r) => (
                  <tr key={r.id} className="hover:bg-[var(--panel-2)] transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap text-[var(--muted)] tabular-nums">{r.fecha}</td>
                    <td className="px-5 py-3.5 font-medium text-[var(--ink)]">{r.usuario}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${ACCION_COLOR[r.accion] ?? 'bg-[var(--panel-2)] text-[var(--ink-soft)]'}`}>
                        <ScrollText size={12} />
                        {ACCION_LABEL[r.accion] ?? r.accion}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--ink-soft)]">{r.detalle}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Paginador page={page} totalPages={totalPages} total={total} onPage={irA} />
      </div>
    </div>
  )
}