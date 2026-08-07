import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts'
import { CalendarRange, TrendingUp, TrendingDown } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import MetricCard from '../components/MetricCard'
import { getReporteResumen } from '../api/reportes'
import { downloadCSV } from '../utils/export'
import toast from 'react-hot-toast'

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0)

const COLORES = ['#f28c28', '#c0392b', '#6a9a3f', '#8e6b2f', '#d97706', '#ef4444', '#3b82f6', '#6b7280']

const iso = (d) => d.toISOString().split('T')[0]
const hoy = () => new Date()

export default function Reportes() {
  const [rango, setRango] = useState('7d') // 'hoy' | '7d' | 'mes' | 'anio' | 'custom'
  const [desde, setDesde] = useState(iso(addDias(hoy(), -6)))
  const [hasta, setHasta] = useState(iso(hoy()))
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)

  function aplicarRango() {
    let d = desde, h = hasta
    const hoyObj = hoy()
    if (rango === 'hoy') { d = iso(hoyObj); h = iso(hoyObj) }
    else if (rango === '7d') { d = iso(addDias(hoyObj, -6)); h = iso(hoyObj) }
    else if (rango === 'mes') { d = iso(new Date(hoyObj.getFullYear(), hoyObj.getMonth(), 1)); h = iso(hoyObj) }
    else if (rango === 'anio') { d = iso(new Date(hoyObj.getFullYear(), 0, 1)); h = iso(hoyObj) }
    setDesde(d); setHasta(h)
    cargar(d, h)
  }

  async function cargar(dd, hh) {
    setCargando(true)
    try {
      const { data } = await getReporteResumen(dd, hh)
      setDatos(data)
    } catch (err) {
      toast.error(err.response?.data?.mensaje ?? 'No se pudo cargar el reporte')
      setDatos(null)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(() => aplicarRango(), 0)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rango])

  const serie = useMemo(
    () => (datos?.serieIngresosVsGastos || []).map((s) => ({
      fecha: s.fecha.slice(5),
      label: s.fecha,
      Ingresos: Number(s.ingresos),
      Gastos: Number(s.gastos),
    })),
    [datos],
  )

  const porHora = (datos?.ventasPorHora || []).map((s) => ({ hora: `${s.hora}:00`.padStart(5, '0'), ventas: s.nroVentas }))
  const porDia = (datos?.ventasPorDiaSemana || [])
    .map((s) => ({ dia: s.dia, ventas: s.nroVentas }))
  const topProductos = (datos?.topProductos || []).map((p) => ({
    nombre: p.nombre, unidades: p.unidades, ingreso: Number(p.ingreso),
    pct: Number(p.pctDelTotal),
  }))
  const gastosCategoria = (datos?.gastosPorCategoria || []).map((g, i) => ({
    name: g.categoria, value: Number(g.monto), fill: COLORES[i % COLORES.length],
  })).filter((g) => g.value > 0)

  const exportarCSV = () => {
    if (!datos) return
    const filas = (datos.serieIngresosVsGastos || []).map((s) => ({
      tipo: 'Día', detalle: s.fecha, montoIngreso: Number(s.ingresos), montoGasto: Number(s.gastos),
    }))
    const top = topProductos.map((p) => ({ tipo: 'Producto', detalle: p.nombre, montoIngreso: p.venta, montoGasto: 0 }))
    downloadCSV('reporte-negocio', [
      { label: 'Tipo', key: 'tipo' },
      { label: 'Detalle', key: 'detalle' },
      { label: 'Ingresos', key: 'montoIngreso' },
      { label: 'Gastos', key: 'montoGasto' },
    ], [...filas, ...top])
  }

  const presets = [
    { id: 'hoy', label: 'Hoy' },
    { id: '7d', label: '7 días' },
    { id: 'mes', label: 'Mes' },
    { id: 'anio', label: 'Año' },
    { id: 'custom', label: 'Personalizado' },
  ]

  const variacionPos = (datos?.variacionIngresos ?? 0) >= 0

  return (
    <div>
      <PageHeader title="Reportes" subtitle={`Análisis del ${datos?.desde} al ${datos?.hasta}`}>
        <Button variant="secondary" onClick={exportarCSV} disabled={!datos}>
          Exportar CSV
        </Button>
      </PageHeader>

      <div className="card px-4 py-3 mb-6 flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => setRango(p.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                rango === p.id ? 'brand-gradient text-white' : ''} border border-[var(--border)]`}
              style={rango === p.id ? {} : { color: 'var(--ink)', background: 'var(--panel-2)' }}
            >
              {p.label}
            </button>
          ))}
        </div>
        {rango === 'custom' && (
          <div className="flex items-center gap-2 flex-wrap">
            <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--border)] text-sm"
              style={{ background: 'var(--panel-2)', color: 'var(--ink)' }} />
            <span className="muted text-sm">→</span>
            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--border)] text-sm"
              style={{ background: 'var(--panel-2)', color: 'var(--ink)' }} />
            <Button variant="secondary" onClick={() => cargar(desde, hasta)}><CalendarRange size={15} /> Aplicar</Button>
          </div>
        )}
        {datos && (
          <div className={`flex items-center gap-2 text-sm font-bold sm:ml-auto ${variacionPos ? 'text-[var(--brand-success)]' : 'text-[var(--brand-danger)]'}`}>
            {variacionPos ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {datos.variacionIngresos >= 0 ? '+' : ''}{datos.variacionIngresos}% vs período anterior
          </div>
        )}
      </div>

      {cargando && !datos ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="card p-5"><div className="skeleton h-3 w-24 mb-3" /><div className="skeleton h-8 w-32" /></div>)}
        </div>
      ) : datos ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard label="Ingresos" value={fmt(datos.ingresoTotal)} icon={<TrendingUp size={18} />} />
            <MetricCard label="Gastos" value={fmt(datos.gastoTotal)} color="red" icon={<TrendingDown size={18} />} />
            <MetricCard label="Utilidad neta" value={fmt(datos.utilidadNeta)} color="green" icon={<CalendarRange size={18} />} />
            <MetricCard label="Margen" value={`${datos.margenPorcentaje}%`} color="yellow" icon={<TrendingUp size={18} />} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <MiniStat label="Ventas" valor={`${datos.nroVentas}`} />
            <MiniStat label="Unidades" valor={fmtCantidad(datos.unidadesVendidas)} />
            <MiniStat label="Ticket promedio" valor={fmt(datos.ticketPromedio)} />
            <MiniStat label="Ing. previo" valor={fmt(datos.ingresoPeriodoAnterior)} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card titulo="Ingresos vs Gastos por día">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={serie}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                  <YAxis tickFormatter={(v) => fmtShort(v)} tick={{ fontSize: 11, fill: 'var(--muted)' }} width={58} />
                  <Tooltip formatter={(v) => fmt(v)} labelStyle={{ color: '#000' }} />
                  <Legend />
                  <Line type="monotone" dataKey="Ingresos" stroke="var(--brand-orange)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Gastos" stroke="var(--brand-red)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card titulo="Ventas por hora (horas pico)">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={porHora}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="hora" tick={{ fontSize: 10, fill: 'var(--muted)' }} interval={2} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--muted)' }} width={30} />
                  <Tooltip />
                  <Bar dataKey="ventas" fill="var(--brand-orange)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
            <Card titulo="Ventas por día de la semana">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={porDia} layout="vertical">
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                  <YAxis type="category" dataKey="dia" width={80} tick={{ fontSize: 12, fill: 'var(--ink)' }} />
                  <Tooltip />
                  <Bar dataKey="ventas" fill="var(--brand-red)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card titulo="Gastos por categoría">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={gastosCategoria} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} label={(e) => `${Math.round(e.percent * 100)}%`}>
                    {gastosCategoria.map((g, i) => <Cell key={i} fill={g.fill} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card titulo="Top productos vendidos">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topProductos} layout="vertical">
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                  <YAxis type="category" dataKey="nombre" width={110} tick={{ fontSize: 11, fill: 'var(--ink)' }} />
                  <Tooltip formatter={(v, n) => (n === 'unidades' ? `${v} uds` : `${v}%`)} />
                  <Bar dataKey="unidades" fill="var(--brand-success)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {(datos.porJornada || []).length > 0 && (
            <div className="card mt-4">
              <h3 className="text-sm font-bold px-5 pt-4" style={{ color: 'var(--ink)' }}>Desempeño por jornada / usuario</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left px-5 py-3 text-xs font-bold text-[var(--muted)] uppercase">Usuario</th>
                      <th className="text-right px-5 py-3 text-xs font-bold text-[var(--muted)] uppercase">Ventas</th>
                      <th className="text-right px-5 py-3 text-xs font-bold text-[var(--muted)] uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {datos.porJornada.map((j, i) => (
                      <tr key={i}>
                        <td className="px-5 py-3 font-semibold" style={{ color: 'var(--ink)' }}>{j.abiertaPor}</td>
                        <td className="px-5 py-3 text-right" style={{ color: 'var(--ink)' }}>{j.nroVentas}</td>
                        <td className="px-5 py-3 text-right font-semibold" style={{ color: 'var(--ink)' }}>{fmt(j.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="muted text-center py-16 text-sm">Selecciona un rango para ver el reporte</p>
      )}
    </div>
  )
}

function addDias(d, n) { const r = new Date(d); r.setDate(d.getDate() + n); return r }
function MiniStat({ label, valor }) {
  return (
    <div className="card-soft px-5 py-4">
      <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-lg font-extrabold" style={{ color: 'var(--ink)' }}>{valor}</p>
    </div>
  )
}
function Card({ titulo, children }) {
  return (
    <div className="card p-5">
      {titulo && <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--ink)' }}>{titulo}</h3>}
      {children}
    </div>
  )
}
const fmtCantidad = (n) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(n || 0)
const fmtShort = (n) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}