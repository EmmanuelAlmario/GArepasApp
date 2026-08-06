export default function StatusBadge({ activo }) {
  return activo ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#e7f3db] text-[var(--brand-success)] border border-[#cfe6b6]">
      Activo
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fde7e4] text-[var(--brand-danger)] border border-[#f8c8bf]">
      Inactivo
    </span>
  )
}

export function BadgePill({ children, tone = 'amber' }) {
  const tones = {
    amber: 'bg-[#fff3d1] text-[#8a5a00] border-[#f2cf7f]',
    red: 'bg-[#fde7e4] text-[var(--brand-danger)] border-[#f8c8bf]',
    green: 'bg-[#e7f3db] text-[var(--brand-success)] border-[#cfe6b6]',
    gray: 'bg-[var(--panel-2)] text-[var(--muted)] border-[var(--border)]',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${tones[tone]}`}>
      {children}
    </span>
  )
}
