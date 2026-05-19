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