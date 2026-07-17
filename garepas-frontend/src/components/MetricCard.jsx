export default function MetricCard({ label, value, sub, color = 'blue' }) {
  const bar = {
    blue: 'bg-[var(--brand-orange)]',
    green: 'bg-[var(--brand-success)]',
    yellow: 'bg-[var(--brand-yellow)]',
    red: 'bg-[var(--brand-danger)]',
  }

  return (
    <div className="bg-[var(--brand-surface)] rounded-xl p-5 shadow-sm border border-[#f5e2af] relative overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${bar[color]}`} />
      <p className="text-xs text-[var(--brand-ink)]/60 font-bold tracking-wide uppercase mb-2">{label}</p>
      <p className="text-3xl font-extrabold text-[var(--brand-ink)]">{value}</p>
      {sub && <p className="text-xs text-[var(--brand-ink)]/60 mt-1">{sub}</p>}
    </div>
  )
}
