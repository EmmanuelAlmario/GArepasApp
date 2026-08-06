import { motion } from 'framer-motion'

const STYLES = {
  blue: { icon: 'brand-gradient', ring: 'from-orange-500/30 to-red-500/30' },
  green: { icon: 'bg-[var(--brand-success)]', ring: 'from-green-500/30 to-emerald-500/30' },
  red: { icon: 'bg-[var(--brand-danger)]', ring: 'from-red-500/30 to-red-400/30' },
  yellow: { icon: 'bg-[var(--brand-yellow)] text-[var(--brand-ink)]', ring: 'from-yellow-400/40 to-orange-400/30' },
}

export default function MetricCard({ label, value, sub, icon, color = 'blue', index = 0, children }) {
  const s = STYLES[color] ?? STYLES.blue
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
      className="card relative overflow-hidden p-5"
    >
      <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full bg-gradient-to-br ${s.ring} blur-2xl`} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)] mb-2">{label}</p>
          <p className="font-num text-3xl font-extrabold leading-none" style={{ color: 'var(--ink)' }}>
            {value}
          </p>
          {sub && <p className="text-xs text-[var(--muted)] mt-1.5">{sub}</p>}
        </div>
        {icon && (
          <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg ${s.icon}`}>
            {icon}
          </div>
        )}
      </div>
      {children && <div className="relative mt-3">{children}</div>}
    </motion.div>
  )
}