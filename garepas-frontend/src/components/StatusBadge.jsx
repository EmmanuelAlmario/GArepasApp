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
