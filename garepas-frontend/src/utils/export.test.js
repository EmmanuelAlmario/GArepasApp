import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { downloadCSV, fechaCSV } from './export'

describe('downloadCSV', () => {
  let blobCapturado
  let clickRealizado

  beforeEach(() => {
    blobCapturado = null
    clickRealizado = false
    vi.stubGlobal('URL', {
      createObjectURL: (b) => { blobCapturado = b; return 'blob:fake' },
      revokeObjectURL: vi.fn(),
    })
    document.body.innerHTML = ''
    const origCreate = document.createElement.bind(document)
    document.createElement = (tag) => {
      const el = origCreate(tag)
      if (tag === 'a') {
        el.click = () => { clickRealizado = true }
      }
      return el
    }
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const columnas = [
    { label: 'Nombre', get: (r) => r.nombre },
    { label: 'Total', key: 'total' },
  ]

  async function contenido() {
    return new TextDecoder().decode(await blobCapturado.arrayBuffer())
  }

  it('genera CSV con BOM, encabezado y una fila', async () => {
    downloadCSV('ventas', columnas, [{ nombre: 'Pepe', total: 3000 }])

    expect(clickRealizado).toBe(true)
    const bytes = new Uint8Array(await blobCapturado.arrayBuffer())
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
    const csv = await contenido()
    expect(csv).toContain('Nombre,Total')
    expect(csv).toContain('Pepe,3000')
  })

  it('escapa comas y comillas dentro de campos', async () => {
    downloadCSV('ventas', columnas, [{ nombre: 'Pepe, "el cajero"; x', total: '1,5' }])

    const csv = await contenido()
    expect(csv).toContain('"Pepe, ""el cajero""; x"')
    expect(csv).toContain('"1,5"')
  })
})

describe('fechaCSV', () => {
  it('formatea fechas válidas', () => {
    const r = fechaCSV('2026-08-07T10:30:00')
    expect(typeof r).toBe('string')
    expect(r.length).toBeGreaterThan(0)
  })
  it('devuelve el texto crudo si la fecha es inválida', () => {
    expect(fechaCSV('no-es-fecha')).toBe('no-es-fecha')
  })
  it('maneja null/undefined', () => {
    expect(fechaCSV(null)).toBe('')
    expect(fechaCSV(undefined)).toBe('')
  })
})