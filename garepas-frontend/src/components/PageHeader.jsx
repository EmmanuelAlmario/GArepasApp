export default function PageHeader({ title, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <h2 className="text-2xl md:text-3xl brand-display text-[var(--brand-ink)]">{title}</h2>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}
