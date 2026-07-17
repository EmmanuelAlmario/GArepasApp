export const aUnidadBase = (cantidad, unidad) => {
  switch (unidad) {
    case 'KILOGRAMO': return cantidad * 1000
    case 'LITRO':     return cantidad * 1000
    case 'CUCHARADA': return cantidad * 15
    case 'TAZA':      return cantidad * 240
    default:          return cantidad
  }
}

export const unidadBase = (unidad) => {
  switch (unidad) {
    case 'KILOGRAMO': return 'GRAMO'
    case 'LITRO':     return 'MILILITRO'
    case 'CUCHARADA': return 'MILILITRO'
    case 'TAZA':      return 'MILILITRO'
    default:          return unidad
  }
}

const fmtNum = (n) =>
  new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(Number(n || 0))

/**
 * Convierte una cantidad en unidad base (GRAMO/MILILITRO/UNIDAD) a su unidad
 * de display más legible: si >= 1000 usa Kg/L, si < 1000 usa g/ml.
 * Devuelve { cantidad, unidad } listos para mostrar.
 */
export const desdeBase = (cantidad, unidadBaseMedida) => {
  const n = Number(cantidad || 0)
  switch (unidadBaseMedida) {
    case 'GRAMO':
      return n >= 1000
        ? { cantidad: n / 1000, unidad: 'KILOGRAMO' }
        : { cantidad: n, unidad: 'GRAMO' }
    case 'MILILITRO':
      return n >= 1000
        ? { cantidad: n / 1000, unidad: 'LITRO' }
        : { cantidad: n, unidad: 'MILILITRO' }
    default:
      return { cantidad: n, unidad: unidadBaseMedida }
  }
}

/**
 * Formatea una cantidad en unidad base a string legible.
 * Ej: 1500 GRAMO → "1.5 Kg", 500 GRAMO → "500 g", 2000 MILILITRO → "2 L"
 */
export const fmtCantidad = (cantidad, unidadBaseMedida) => {
  const { cantidad: c, unidad } = desdeBase(cantidad, unidadBaseMedida)
  const etiqueta = {
    GRAMO: 'g',
    KILOGRAMO: 'Kg',
    MILILITRO: 'ml',
    LITRO: 'L',
    UNIDAD: c === 1 ? 'unidad' : 'unidades',
    CUCHARADA: 'cdas',
    TAZA: 'tazas',
  }[unidad] ?? unidad?.toLowerCase() ?? ''
  return `${fmtNum(c)} ${etiqueta}`
}