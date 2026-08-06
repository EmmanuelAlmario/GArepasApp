const escapeField = (v) => {
  const s = v == null ? '' : String(v)
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/**
 * Descarga un CSV (UTF-8 con BOM) compatible con Excel.
 * @param {string} filename nombre del archivo (sin extensión)
 * @param {Array<{label:string, get?:Function, key?:string}>} columns
 * @param {Array<object>} rows
 */
export function downloadCSV(filename, columns, rows) {
  const header = columns.map((c) => escapeField(c.label)).join(',')
  const body = rows
    .map((row) => columns.map((c) => escapeField(c.get ? c.get(row) : row[c.key])).join(','))
    .join('\n')
  const csv = '\uFEFF' + header + '\n' + body
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const fechaCSV = (fecha) => {
  const d = new Date(fecha)
  if (Number.isNaN(d.getTime())) return fecha || ''
  return d.toLocaleString('es-CO')
}