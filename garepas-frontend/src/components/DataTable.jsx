export default function DataTable({ columns, data, onEdit, onDelete, loading = false }) {
  if (loading) {
    return (
      <div className="card p-8 text-center space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-6 w-full" />
        ))}
      </div>
    )
  }
  if (!data || data.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="muted text-sm">No hay registros para mostrar</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-[var(--border)]" style={{ background: 'var(--panel-2)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-5 py-3.5 text-xs font-bold text-[var(--muted)] uppercase tracking-wide"
                >
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-5 py-3.5 text-xs font-bold text-[var(--muted)] uppercase tracking-wide text-right">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {data.map((row, i) => (
              <tr key={row.id ?? i} className="hover:bg-[var(--panel-2)] transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-3.5" style={{ color: 'var(--ink)' }}>
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