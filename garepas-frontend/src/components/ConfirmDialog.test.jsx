import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ConfirmDialog from './ConfirmDialog'

describe('ConfirmDialog', () => {
  it('no renderiza nada cuando no está abierto', () => {
    const { container } = render(<ConfirmDialog open={false} title="X" message="M" onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('muestra título y mensaje', () => {
    render(<ConfirmDialog open title="Eliminar venta" message="¿Seguro?" onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText('Eliminar venta')).toBeTruthy()
    expect(screen.getByText('¿Seguro?')).toBeTruthy()
  })

  it('confirma y cancela con los callbacks', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(<ConfirmDialog open title="Eliminar" message="M" onConfirm={onConfirm} onCancel={onCancel} />)

    fireEvent.click(screen.getByText('Confirmar'))
    expect(onConfirm).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByText('Cancelar'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})