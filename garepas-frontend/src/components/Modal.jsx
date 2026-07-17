export default function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--brand-surface)] rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg mx-0 sm:mx-4 max-h-[92vh] overflow-y-auto border border-[#f4d177]">
        <div className="h-1.5 brand-gradient" />
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#f5e6be]">
          <h3 className="text-base font-extrabold text-[var(--brand-ink)]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[var(--brand-ink)]/50 hover:text-[var(--brand-red)] transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="px-5 sm:px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
