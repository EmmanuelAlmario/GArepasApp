import { describe, it, expect } from 'vitest'
import { aUnidadBase, unidadBase, desdeBase, fmtCantidad } from './unidades'

describe('aUnidadBase', () => {
  it('convierte KILOGRAMO a gramos', () => {
    expect(aUnidadBase(1.5, 'KILOGRAMO')).toBe(1500)
  })
  it('convierte LITRO a mililitros', () => {
    expect(aUnidadBase(2, 'LITRO')).toBe(2000)
  })
  it('convierte CUCHARADA (15 ml) y TAZA (240 ml)', () => {
    expect(aUnidadBase(3, 'CUCHARADA')).toBe(45)
    expect(aUnidadBase(2, 'TAZA')).toBe(480)
  })
  it('deja UNIDAD/GRAMO/MILILITRO igual', () => {
    expect(aUnidadBase(5, 'UNIDAD')).toBe(5)
    expect(aUnidadBase(7, 'GRAMO')).toBe(7)
    expect(aUnidadBase(9, 'MILILITRO')).toBe(9)
  })
})

describe('unidadBase', () => {
  it('normaliza a la unidad base de medida', () => {
    expect(unidadBase('KILOGRAMO')).toBe('GRAMO')
    expect(unidadBase('LITRO')).toBe('MILILITRO')
    expect(unidadBase('CUCHARADA')).toBe('MILILITRO')
    expect(unidadBase('TAZA')).toBe('MILILITRO')
    expect(unidadBase('UNIDAD')).toBe('UNIDAD')
  })
})

describe('desdeBase', () => {
  it('pasa gramos a Kg si >= 1000', () => {
    expect(desdeBase(1500, 'GRAMO')).toEqual({ cantidad: 1.5, unidad: 'KILOGRAMO' })
  })
  it('pasa ml a litros si >= 1000', () => {
    expect(desdeBase(2500, 'MILILITRO')).toEqual({ cantidad: 2.5, unidad: 'LITRO' })
  })
  it('mantiene unidades pequeñas', () => {
    expect(desdeBase(500, 'GRAMO')).toEqual({ cantidad: 500, unidad: 'GRAMO' })
  })
  it('usa el formato regional para la cantidad', () => {
    expect(desdeBase(0, 'GRAMO')).toEqual({ cantidad: 0, unidad: 'GRAMO' })
  })
})

describe('fmtCantidad', () => {
  it('formatea gramos', () => {
    expect(fmtCantidad(500, 'GRAMO')).toBe('500 g')
  })
  it('formatea kilos', () => {
    expect(fmtCantidad(1500, 'GRAMO')).toBe('1,5 Kg')
  })
  it('formatea litros', () => {
    expect(fmtCantidad(2000, 'MILILITRO')).toBe('2 L')
  })
  it('formatea unidades con plural', () => {
    expect(fmtCantidad(1, 'UNIDAD')).toBe('1 unidad')
    expect(fmtCantidad(3, 'UNIDAD')).toBe('3 unidades')
  })
  it('no truena con null o undefined', () => {
    expect(fmtCantidad(null, 'GRAMO')).toBe('0 g')
  })
})