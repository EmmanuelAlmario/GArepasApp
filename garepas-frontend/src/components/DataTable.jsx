export default function DataTable({ columns, data, onEdit, onDelete, loading = false }) {
  if (loading) {
    return (
      <div className="bg-[var(--brand-surface)] rounded-xl border border-[#f5e2af] shadow-sm p-12 text-center">
        <p className="text-[var(--brand-ink)]/40 text-sm">Cargando…</p>
      </div>
    )
  }
  if (!data || data.length === 0) {
    return (
      <div className="bg-[var(--brand-surface)] rounded-xl border border-[#f5e2af] shadow-sm p-12 text-center">
        <p className="text-[var(--brand-ink)]/60 text-sm">No hay registros para mostrar</p>
      </div>
    )
  }

  return (
    <div className="bg-[var(--brand-surface)] rounded-xl border border-[#f5e2af] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-[#f2e0b2] bg-[#fff4d6]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-5 py-3.5 text-xs font-bold text-[var(--brand-ink)]/70 uppercase tracking-wide"
                >
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-5 py-3.5 text-xs font-bold text-[var(--brand-ink)]/70 uppercase tracking-wide text-right">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f9eecf]">
            {data.map((row, i) => (
              <tr key={row.id ?? i} className="hover:bg-[#fff7e5] transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-3.5 text-[var(--brand-ink)]">
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-[#ffeec2] text-[var(--brand-ink)] hover:bg-[#ffe5a6] font-bold transition-colors"
                        >
                          Editar
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row.id)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-[#fde7e4] text-[var(--brand-danger)] hover:bg-[#fbd4ce] font-bold transition-colors"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
