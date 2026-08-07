import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Paginador({ page, totalPages, total, onPage }) {
  if (totalPages <= 1) return null

  const rango = []
  const desde = Math.max(1, page - 2)
  const hasta = Math.min(totalPages, page + 2)
  for (let p = desde; p <= hasta; p++) rango.push(p)

  const clase = (activo) =>
    `min-w-9 h-9 px-1 rounded-lg text-sm font-semibold transition-colors border ${
      activo
        ? 'bg-[var(--brand-orange)] text-white border-[var(--brand-orange)]'
        : 'border-[var(--border)] text-[var(--muted)] hover:bg-[var(--panel-2)]'
    }`

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-t border-[var(--border)]">
      <span className="text-sm text-[var(--muted)]">
        Página <b className="text-[var(--ink)]">{page}</b> de <b className="text-[var(--ink)]">{totalPages}</b> · {total} registro(s)
      </span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
          className={`${clase(false)} inline-flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <ChevronLeft size={18} />
        </button>
        {desde > 1 && <span className="px-1 text-[var(--muted)]">…</span>}
        {rango.map((p) => (
          <button key={p} onClick={() => onPage(p)} aria-current={p === page ? 'page' : undefined} className={clase(p === page)}>
            {p}
          </button>
        ))}
        {hasta < totalPages && <span className="px-1 text-[var(--muted)]">…</span>}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          aria-label="Página siguiente"
          className={`${clase(false)} inline-flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}