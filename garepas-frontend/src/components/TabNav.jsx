import { motion } from 'framer-motion'

export default function TabNav({ tabs, active, onChange }) {
  return (
    <div className="card p-1.5 mb-6 overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {tabs.map((tab) => {
          const selected = tab.value === active
          return (
            <button
              key={tab.value}
              onClick={() => onChange(tab.value)}
              className={`relative px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                selected ? 'text-[var(--brand-ink)]' : 'text-[var(--brand-ink)]/60 hover:text-[var(--brand-ink)]'
              }`}
            >
              {selected && (
                                <motion.span
                  layoutId="tabHighlight"
                  className="absolute inset-0 rounded-lg border"
                  style={{ background: 'var(--brand-yellow-soft)', borderColor: 'var(--border-strong)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
