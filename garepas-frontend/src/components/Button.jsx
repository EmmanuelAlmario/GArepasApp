export default function Button({ children, onClick, variant = 'primary', type = 'button', disabled }) {
  const variants = {
    primary:
      'brand-gradient text-white hover:brightness-110 shadow-sm shadow-orange-400/40 border border-[var(--brand-red)]',
    danger:
      'bg-[var(--brand-danger)] text-white hover:brightness-110 shadow-sm shadow-red-300 border border-red-900/20',
    secondary:
      'bg-[#fff4c9] text-[var(--brand-ink)] hover:bg-[#ffe9a6] border border-[#f5cf6f]',
    success:
      'bg-[var(--brand-success)] text-white hover:brightness-110 shadow-sm shadow-green-300 border border-green-900/20',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-extrabold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`}
    >
      {children}
    </button>
  )
}
