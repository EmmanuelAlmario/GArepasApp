import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Paginador from './Paginador'

describe('Paginador', () => {
  it('no se renderiza si hay una sola página', () => {
    const { container } = render(<Paginador page={1} totalPages={1} total={5} onPage={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('muestra contador de página y total', () => {
    render(<Paginador page={2} totalPages={5} total={120} onPage={vi.fn()} />)
    expect(document.body.textContent).toContain('Página 2 de 5')
    expect(document.body.textContent).toContain('120 registro(s)')
  })

  it('llama onPage con la página siguiente', () => {
    const onPage = vi.fn()
    render(<Paginador page={2} totalPages={5} total={120} onPage={onPage} />)
    fireEvent.click(screen.getByLabelText('Página siguiente'))
    expect(onPage).toHaveBeenCalledWith(3)
  })

  it('deshabilita anterior en la primera página', () => {
    render(<Paginador page={1} totalPages={3} total={30} onPage={vi.fn()} />)
    expect(screen.getByLabelText('Página anterior').disabled).toBe(true)
  })

  it('deshabilita siguiente en la última página', () => {
    render(<Paginador page={3} totalPages={3} total={30} onPage={vi.fn()} />)
    expect(screen.getByLabelText('Página siguiente').disabled).toBe(true)
  })

  it('navega a una página por número', () => {
    const onPage = vi.fn()
    render(<Paginador page={1} totalPages={6} total={60} onPage={onPage} />)
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    expect(onPage).toHaveBeenCalledWith(3)
  })
})