import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle({ theme, onToggle, className = '' }) {
  const dark = theme === 'dark'
  return (
    <button
      onClick={onToggle}
      title={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
        dark ? 'text-[var(--brand-yellow)] hover:bg-white/10' : 'text-[var(--brand-ink)]/70 hover:bg-white/60'
      } ${className}`}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}