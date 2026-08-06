import { useId } from 'react'

export default function FormField({ label, name, type = 'text', value, onChange, options, required, ...rest }) {
  const id = useId()
  const base = 'w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-orange)]/30 focus:border-[var(--brand-orange)] transition-all'
  const themedInput = { background: 'var(--panel-2)', color: 'var(--ink)' }

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {type === 'select' ? (
        <select id={id} name={name} value={value} onChange={onChange} required={required} className={base} style={themedInput} {...rest}>

          <option value="">Seleccionar...</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={base}
          style={themedInput}
          {...rest}
        />
      )}
    </div>
  )
}
