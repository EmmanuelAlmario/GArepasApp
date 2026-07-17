export default function FormField({ label, name, type = 'text', value, onChange, options, required }) {
  const base = 'w-full px-3 py-2.5 rounded-lg border border-[#f1ddb0] bg-white text-sm text-[var(--brand-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-orange)]/30 focus:border-[var(--brand-orange)] transition-all'

  return (
    <div>
      <label className="block text-xs font-bold text-[var(--brand-ink)]/70 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {type === 'select' ? (
        <select name={name} value={value} onChange={onChange} required={required} className={base}>
          <option value="">Seleccionar...</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={base}
        />
      )}
    </div>
  )
}
