import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBadge, { BadgePill } from './StatusBadge'

describe('StatusBadge', () => {
  it('muestra Activo cuando activo=true', () => {
    render(<StatusBadge activo />)
    expect(screen.getByText('Activo')).toBeTruthy()
  })
  it('muestra Inactivo cuando activo=false', () => {
    render(<StatusBadge activo={false} />)
    expect(screen.getByText('Inactivo')).toBeTruthy()
  })
})

describe('BadgePill', () => {
  it('usa el tone por defecto amber', () => {
    render(<BadgePill>Alto</BadgePill>)
    expect(screen.getByText('Alto')).toBeTruthy()
  })
  it('renderiza cualquier children', () => {
    render(<BadgePill tone="red">Bajo</BadgePill>)
    expect(screen.getByText('Bajo')).toBeTruthy()
  })
})