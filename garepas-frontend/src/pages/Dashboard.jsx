import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as PieTooltip,
} from 'recharts'
import { Banknote, Receipt, PackageCheck, Layers, AlertTriangle, TrendingUp, Coins, Timer, QrCode, ShoppingCart } from 'lucide-react'
import { BadgePill } from '../components/StatusBadge'
import MenuQR from '../components/MenuQR'
import { fmtCantidad } from '../utils/unidades'
import MetricCard from '../components/MetricCard'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import { getInsumos } from '../api/insumos'
import { getProductos } from '../api/productos'
import { getVentas } from '../api/ventas'
import { getGastos } from '../api/gastos'
import { getRecetas } from '../api/recetas'
import { downloadCSV, fechaCSV } from '../utils/export'

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const COLORES_DONA = ['#f28c28', '#c0392b', '#6a9a3f']

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

const fmtShort = (n) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg px-4 py-3 text-sm shadow-lg" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
      <p className="font-semibold mb-1" style={{ color: 'var(--ink)' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  )
}

const CustomDonaTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg px-4 py-3 text-sm shadow-lg" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
      <p className="font-semibold" style={{ color: payload[0].payload.fill }}>
        {payload[0].name}: {fmt(payload[0].value)}
      </p>
    </div>
  )
}

export default function Dashboard() {
  const [datos, setDatos] = useState({ insumos: [], productos: [], ventas: [], gastos: [], recetas: [] })
  const [cargando, setCargando] = useState(true)
  const [qrAbierto, setQrAbierto] = useState(false)

  useEffect(() => {
    let activo = true
    const cargarSeccion = async (key, fn) => {
      try {
        const r = await fn()
        if (activo) setDatos((d) => ({ ...d, [key]: r.data }))
      } catch (err) {
        console.error(`Error cargando ${key}`, err)
      }
    }
    Promise.allSettled([
      cargarSeccion('insumos', getInsumos),
      cargarSeccion('productos', getProductos),
      cargarSeccion('ventas', getVentas),
      cargarSeccion('gastos', getGastos),
      cargarSeccion('recetas', getRecetas),
    ]).finally(() => {
      if (activo) setCargando(false)
    })
    return () => { activo = false }
  }, [])

  const totalVentas = datos.ventas.reduce((acc, v) => acc + Number(v.total), 0)
  const productosActivos = datos.productos.filter((p) => p.activo).length
  const bajosInsumos = datos.insumos.filter((i) => i.stockBajo)
  const bajosProductos = datos.productos.filter((p) => p.stockBajo)

  const hoy = new Date()
  const semanaInicio = new Date(hoy); semanaInicio.setDate(hoy.getDate() - 6); semanaInicio.setHours(0, 0, 0, 0)
  const esHoy = (f) => { const d = new Date(f); return d.toDateString() === hoy.toDateString() }
  const ventasHoy = datos.ventas.filter((v) => esHoy(v.fecha))
  const ventasSemana = datos.ventas.filter((v) => new Date(v.fecha) >= semanaInicio)
  const ingresosHoy = ventasHoy.reduce((a, v) => a + Number(v.total), 0)
  const ingresosSemana = ventasSemana.reduce((a, v) => a + Number(v.total), 0)
  const ticketPromedio = datos.ventas.length > 0 ? totalVentas / datos.ventas.length : 0

  const topProductos = () => {
    const m = {}
    datos.ventas.forEach((v) => (v.detalles || []).forEach((d) => {
      if (!m[d.productoNombre]) m[d.productoNombre] = { nombre: d.productoNombre, cantidad: 0 }
      m[d.productoNombre].cantidad += d.cantidad
    }))
    return Object.values(m).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5)
  }

  const margenes = datos.productos
    .map((p) => ({ nombre: p.nombre, margen: Number(p.margenPorcentaje || 0), costo: p.costoUnitario || 0 }))
    .sort((a, b) => a.margen - b.margen)
    .slice(0, 5)

  const TARGET_DIAS = 7
  const consumoInsumo = {}
  const diasConVentas = new Set()
  datos.ventas.forEach((v) => {
    const dd = new Date(v.fecha)
    if (!Number.isNaN(dd.getTime())) diasConVentas.add(dd.toDateString())
    ;(v.detalles || []).forEach((det) => {
      const prod = datos.productos.find((p) => p.id === det.productoId)
      if (!prod?.recetaId) return
      const receta = datos.recetas.find((r) => r.id === prod.recetaId)
      ;(receta?.detalles || []).forEach((dr) => {
        consumoInsumo[dr.insumoId] = (consumoInsumo[dr.insumoId] || 0) + det.cantidad * Number(dr.cantidad)
      })
    })
  })
  const nDias = Math.max(diasConVentas.size, 1)
  const reposicion = datos.insumos
    .map((ins) => {
      const consumido = consumoInsumo[ins.id] || 0
      const tasa = consumido / nDias
      const necesito = tasa * TARGET_DIAS
      const aComprar = Math.max(0, necesito - Number(ins.stockActual))
      return { ...ins, consumido, aComprar }
    })
    .filter((x) => x.aComprar > 0)
    .sort((a, b) => b.aComprar - a.aComprar)
    .slice(0, 6)
  const hayReposTotal = reposicion.length > 0
  const totalGastos = datos.gastos.reduce((acc, g) => acc + Number(g.monto), 0)
  const cogs = datos.gastos
    .filter((g) => g.categoria === 'MATERIA_PRIMA')
    .reduce((acc, g) => acc + Number(g.monto), 0)
  const rentabilidad = totalVentas - totalGastos
  const margen = totalVentas > 0 ? ((rentabilidad / totalVentas) * 100).toFixed(1) : 0

  // Agrupar ventas y gastos por mes
  const exportarResumen = () => {
    const filas = [
      ...datos.ventas.map((v) => ({ tipo: 'Venta', fuente: `#${v.id}`, fecha: v.fecha, monto: Number(v.total) })),
      ...datos.gastos.map((g) => ({ tipo: 'Gasto', fuente: g.descripcion, fecha: g.fecha, monto: Number(g.monto) })),
    ]
    downloadCSV('resumen-negocio', [
      { label: 'Tipo', key: 'tipo' },
      { label: 'Detalle', key: 'fuente' },
      { label: 'Fecha', get: (r) => fechaCSV(r.fecha) },
      { label: 'Monto', key: 'monto' },
    ], filas)
  }

  // Agrupar ventas y gastos por mes
  const porMes = () => {
    const mapa = {}

    ;[...datos.ventas, ...datos.gastos].forEach((item) => {
      const esVenta = item.total !== undefined
      const fecha = new Date(item.fecha)
      if (Number.isNaN(fecha.getTime())) return
      const clave = `${fecha.getFullYear()}-${fecha.getMonth()}`
      if (!mapa[clave]) mapa[clave] = { mes: `${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`, ingresos: 0, gastos: 0, año: fecha.getFullYear(), m: fecha.getMonth() }
      if (esVenta) mapa[clave].ingresos += Number(item.total)
      else mapa[clave].gastos += Number(item.monto)
    })

    return Object.values(mapa)
      .sort((a, b) => a.año - b.año || a.m - b.m)
      .map((m) => ({ ...m, rentabilidad: m.ingresos - m.gastos }))
  }

  const dataMes = porMes()

  const dataDona = [
    { name: 'Ingresos', value: totalVentas, fill: COLORES_DONA[0] },
    { name: 'Gastos', value: totalGastos, fill: COLORES_DONA[1] },
    { name: 'Utilidad', value: Math.max(rentabilidad, 0), fill: COLORES_DONA[2] },
  ].filter((d) => d.value > 0)

  return (
    <div>
      <PageHeader title="Dashboard">
        <Button variant="secondary" onClick={() => setQrAbierto(true)}>
          <QrCode size={16} /> Menú QR
        </Button>
        <Button variant="secondary" onClick={exportarResumen} disabled={datos.ventas.length === 0 && datos.gastos.length === 0}>
          Exportar resumen
        </Button>
      </PageHeader>

      {qrAbierto && <MenuQR onClose={() => setQrAbierto(false)} />}

      {cargando && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card p-5">
              <div className="skeleton h-3 w-24 mb-3" />
              <div className="skeleton h-8 w-32" />
            </div>
          ))}
        </div>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Ingresos totales" value={fmt(totalVentas)} sub="Suma de ventas" icon={<Banknote size={20} />} color="blue" index={0} />
        <MetricCard label="Gastos totales" value={fmt(totalGastos)} sub="Suma de gastos" icon={<Receipt size={20} />} color="red" index={1} />
        <MetricCard label="COGS" value={fmt(cogs)} sub="Materia prima" icon={<Layers size={20} />} color="yellow" index={2} />
        <MetricCard label="Productos activos" value={productosActivos} sub="En catálogo" icon={<PackageCheck size={20} />} color="green" index={3} />
      </div>

      {/* KPI operativos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard label="Ingresos hoy" value={fmt(ingresosHoy)} sub={`${ventasHoy.length} ventas`} icon={<Banknote size={20} />} color="blue" index={0} />
        <MetricCard label="Ticket promedio" value={fmt(ticketPromedio)} sub="Por venta" icon={<Coins size={20} />} color="green" index={1} />
        <MetricCard label="Ingresos 7 días" value={fmt(ingresosSemana)} sub="Última semana" icon={<Timer size={20} />} color="yellow" index={2} />
      </div>

      <div className="mb-5 card px-4 py-3 text-sm font-bold text-[var(--ink)] flex items-center justify-between gap-3">
        <span>Rentabilidad real</span>
        <span className="font-num text-base" style={{ color: rentabilidad >= 0 ? 'var(--brand-success)' : 'var(--brand-danger)' }}>
          {fmt(rentabilidad)}
        </span>
      </div>

      {/* Inventario crítico */}
      {(datos.insumos.some((i) => i.stockBajo) || datos.productos.some((p) => p.stockBajo)) && (
        <div className="card p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} style={{ color: 'var(--brand-danger)' }} />
            <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>Inventario crítico</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bajosInsumos.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase text-[var(--muted)] mb-2">Insumos por reponer</p>
                <ul className="space-y-1.5">
                  {bajosInsumos.map((i) => (
                    <li key={i.id} className="flex items-center justify-between text-sm">
                      <span style={{ color: 'var(--ink)' }}>{i.nombre}</span>
                      <BadgePill tone="red">{fmtCantidad(i.stockActual, i.unidadMedida)}</BadgePill>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {bajosProductos.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase text-[var(--muted)] mb-2">Productos sin stock</p>
                <ul className="space-y-1.5">
                  {bajosProductos.map((p) => (
                    <li key={p.id} className="flex items-center justify-between text-sm">
                      <span style={{ color: 'var(--ink)' }}>{p.nombre}</span>
                      <BadgePill tone="red">{p.stockActual} uds</BadgePill>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sugerencia de compra */}
      {hayReposTotal && (
        <div className="card p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCart size={18} style={{ color: 'var(--brand-orange)' }} />
            <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>Sugerencia de compra · próximos 7 días</h3>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {reposicion.map((r) => (
              <li key={r.id} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg border border-[var(--border)]" style={{ background: 'var(--panel-2)' }}>
                <span style={{ color: 'var(--ink)' }}>{r.nombre}</span>
                <span className="font-bold" style={{ color: 'var(--brand-orange)' }}>
                  +{fmtCantidad(r.aComprar, r.unidadMedida)}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs muted mt-3">Estimado según el consumo de ventas registradas. Revisa antes de comprar.</p>
        </div>
      )}

      {/* Gráficos rentabilidad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        {/* Dona */}
        <div className="card p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Rentabilidad del negocio</h3>
          <p className="text-xs text-gray-400 mb-4">Distribución acumulada</p>

          {dataDona.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">Sin datos</p>
          ) : (
            <>
              <div className="relative flex items-center justify-center">
                <PieChart width={200} height={200}>
                  <Pie
                    data={dataDona}
                    cx={100}
                    cy={100}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {dataDona.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <PieTooltip content={<CustomDonaTooltip />} />
                </PieChart>
                <div className="absolute flex flex-col items-center pointer-events-none">
                  <span className="text-2xl font-bold text-gray-800">{margen}%</span>
                  <span className="text-xs text-gray-400">Margen</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {dataDona.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                      <span className="text-gray-500">{d.name}</span>
                    </div>
                    <span className="font-semibold text-gray-700">{fmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Barras por mes */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Ingresos vs Gastos</h3>
          <p className="text-xs text-gray-400 mb-4">Por mes</p>

          {dataMes.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">Sin datos por mes</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dataMes} barCategoryGap="30%" barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 11, fill: 'var(--muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={fmtShort}
                  tick={{ fontSize: 11, fill: 'var(--muted)' }}
                  axisLine={false}
                  tickLine={false}
                  width={55}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar dataKey="ingresos" name="Ingresos" fill="#f28c28" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gastos" name="Gastos" fill="#c0392b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rentabilidad" name="Rentabilidad" fill="#6a9a3f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top productos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} style={{ color: 'var(--brand-orange)' }} />
            <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>Top productos vendidos</h3>
          </div>
          {topProductos().length === 0 ? (
            <p className="muted text-sm text-center py-6">Sin ventas</p>
          ) : (
            <ul className="space-y-2.5">
              {topProductos().map((p, i) => (
                <li key={p.nombre} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2" style={{ color: 'var(--ink)' }}>
                    <span className="w-6 h-6 rounded-md bg-[var(--panel-2)] border border-[var(--border)] flex items-center justify-center text-xs font-bold text-[var(--muted)]">
                      {i + 1}
                    </span>
                    {p.nombre}
                  </span>
                  <span className="font-bold" style={{ color: 'var(--ink)' }}>{p.cantidad} uds</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Márgenes bajos */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={16} style={{ color: 'var(--brand-danger)' }} />
            <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>Márgenes por revisar</h3>
            <span className="text-xs text-[var(--muted)] ml-auto">menor margen %</span>
          </div>
          {margenes.length === 0 ? (
            <p className="muted text-sm text-center py-6">Sin productos</p>
          ) : (
            <ul className="space-y-2.5">
              {margenes.filter((m) => m.margen <= 25).map((m) => (
                <li key={m.nombre} className="flex items-center justify-between text-sm">
                  <span style={{ color: 'var(--ink)' }}>{m.nombre}</span>
                  <BadgePill tone={m.margen < 10 ? 'red' : 'amber'}>{m.margen.toFixed(1)}%</BadgePill>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Tablas resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Últimas ventas</h3>
          {datos.ventas.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Sin ventas registradas</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[320px]">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left pb-2 text-xs text-[var(--muted)] font-semibold uppercase">ID</th>
                    <th className="text-left pb-2 text-xs text-[var(--muted)] font-semibold uppercase">Fecha</th>
                    <th className="text-right pb-2 text-xs text-[var(--muted)] font-semibold uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {datos.ventas.slice(0, 5).map((v) => (
                    <tr key={v.id}>
                      <td className="py-2.5 text-[var(--muted)]">#{v.id}</td>
                      <td className="py-2.5 text-[var(--ink-soft)]">
                        {new Date(v.fecha).toLocaleDateString('es-CO')}
                      </td>
                      <td className="py-2.5 text-right font-medium text-[var(--ink)]">{fmt(v.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Últimos gastos</h3>
          {datos.gastos.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Sin gastos registrados</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[380px]">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left pb-2 text-xs text-[var(--muted)] font-semibold uppercase">Descripción</th>
                    <th className="text-left pb-2 text-xs text-[var(--muted)] font-semibold uppercase">Categoría</th>
                    <th className="text-right pb-2 text-xs text-[var(--muted)] font-semibold uppercase">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {datos.gastos.slice(0, 5).map((g) => (
                    <tr key={g.id}>
                      <td className="py-2.5 text-[var(--ink-soft)] truncate max-w-[150px]">{g.descripcion}</td>
                      <td className="py-2.5 text-[var(--muted)]">{g.categoria}</td>
                      <td className="py-2.5 text-right font-medium text-[var(--ink)]">{fmt(g.monto)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
