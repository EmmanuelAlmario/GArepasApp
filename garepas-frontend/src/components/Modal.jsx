import { useEffect, useRef } from 'react'

export default function Modal({ title, onClose, children }) {
  const panelRef = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    const panel = panelRef.current
    const prevFocused = document.activeElement
    const focusables = () =>
      panel ? Array.from(panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')) : []

    const focusFirst = () => {
      const f = focusables()
      if (f[0]) f[0].focus()
      else panel?.focus()
    }

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current?.()
        return
      }
      if (e.key !== 'Tab') return
      const f = focusables()
      if (f.length === 0) return
      const first = f[0]
      const last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    focusFirst()
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      if (prevFocused instanceof HTMLElement) prevFocused.focus()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="relative card-soft rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg mx-0 sm:mx-4 max-h-[92vh] overflow-y-auto outline-none"
      >
        <div className="h-1.5 brand-gradient" />
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[var(--border)]">
          <h3 className="text-base font-extrabold" style={{ color: 'var(--ink)' }}>{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-[var(--muted)] hover:text-[var(--brand-red)] transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="px-5 sm:px-6 py-5">{children}</div>
      </div>
    </div>
  )
}