import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as PieTooltip,
} from 'recharts'
import MetricCard from '../components/MetricCard'
import PageHeader from '../components/PageHeader'
import { getInsumos } from '../api/insumos'
import { getProductos } from '../api/productos'
import { getVentas } from '../api/ventas'
import { getGastos } from '../api/gastos'

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
    <div className="bg-white border border-gray-100 shadow-lg rounded-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
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
    <div className="bg-white border border-gray-100 shadow-lg rounded-lg px-4 py-3 text-sm">
      <p className="font-semibold" style={{ color: payload[0].payload.fill }}>
        {payload[0].name}: {fmt(payload[0].value)}
      </p>
    </div>
  )
}

export default function Dashboard() {
  const [datos, setDatos] = useState({ insumos: [], productos: [], ventas: [], gastos: [] })

  useEffect(() => {
    Promise.all([getInsumos(), getProductos(), getVentas(), getGastos()])
      .then(([ins, prod, ven, gas]) => {
        setDatos({
          insumos: ins.data,
          productos: prod.data,
          ventas: ven.data,
          gastos: gas.data,
        })
      })
      .catch(console.error)
  }, [])

  const totalVentas = datos.ventas.reduce((acc, v) => acc + Number(v.total), 0)
  const totalGastos = datos.gastos.reduce((acc, g) => acc + Number(g.monto), 0)
  const cogs = datos.gastos
    .filter((g) => g.categoria === 'MATERIA_PRIMA')
    .reduce((acc, g) => acc + Number(g.monto), 0)
  const rentabilidad = totalVentas - totalGastos
  const margen = totalVentas > 0 ? ((rentabilidad / totalVentas) * 100).toFixed(1) : 0
  const productosActivos = datos.productos.filter((p) => p.activo).length

  // Agrupar ventas y gastos por mes
  const porMes = () => {
    const mapa = {}

    datos.ventas.forEach((v) => {
      const fecha = new Date(v.fecha)
      const clave = `${fecha.getFullYear()}-${fecha.getMonth()}`
      if (!mapa[clave]) mapa[clave] = { mes: `${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`, ingresos: 0, gastos: 0, año: fecha.getFullYear(), m: fecha.getMonth() }
      mapa[clave].ingresos += Number(v.total)
    })

    datos.gastos.forEach((g) => {
      const fecha = new Date(g.fecha)
      const clave = `${fecha.getFullYear()}-${fecha.getMonth()}`
      if (!mapa[clave]) mapa[clave] = { mes: `${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`, ingresos: 0, gastos: 0, año: fecha.getFullYear(), m: fecha.getMonth() }
      mapa[clave].gastos += Number(g.monto)
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
      <PageHeader title="Dashboard" />

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Ingresos totales" value={fmt(totalVentas)} sub="Suma de ventas" color="blue" />
        <MetricCard label="Gastos totales" value={fmt(totalGastos)} sub="Suma de gastos" color="red" />
        <MetricCard label="COGS" value={fmt(cogs)} sub="Materia prima" color="yellow" />
        <MetricCard label="Productos activos" value={productosActivos} sub="En catálogo" color="yellow" />
      </div>

      <div className="mb-5 bg-[#fff1c6] border border-[#f6d67f] rounded-xl px-4 py-3 text-sm font-bold text-[var(--brand-ink)]">
        Rentabilidad real: {fmt(rentabilidad)}
      </div>

      {/* Gráficos rentabilidad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        {/* Dona */}
        <div className="bg-[var(--brand-surface)] rounded-xl border border-[#f5e2af] shadow-sm p-5 flex flex-col">
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
        <div className="lg:col-span-2 bg-[var(--brand-surface)] rounded-xl border border-[#f5e2af] shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Ingresos vs Gastos</h3>
          <p className="text-xs text-gray-400 mb-4">Por mes</p>

          {dataMes.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">Sin datos por mes</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dataMes} barCategoryGap="30%" barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={fmtShort}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
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

      {/* Tablas resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[var(--brand-surface)] rounded-xl border border-[#f5e2af] shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Últimas ventas</h3>
          {datos.ventas.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Sin ventas registradas</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[320px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left pb-2 text-xs text-gray-400 font-semibold uppercase">ID</th>
                    <th className="text-left pb-2 text-xs text-gray-400 font-semibold uppercase">Fecha</th>
                    <th className="text-right pb-2 text-xs text-gray-400 font-semibold uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {datos.ventas.slice(0, 5).map((v) => (
                    <tr key={v.id}>
                      <td className="py-2.5 text-gray-500">#{v.id}</td>
                      <td className="py-2.5 text-gray-700">
                        {new Date(v.fecha).toLocaleDateString('es-CO')}
                      </td>
                      <td className="py-2.5 text-right font-medium text-gray-800">{fmt(v.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-[var(--brand-surface)] rounded-xl border border-[#f5e2af] shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Últimos gastos</h3>
          {datos.gastos.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Sin gastos registrados</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[380px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left pb-2 text-xs text-gray-400 font-semibold uppercase">Descripción</th>
                    <th className="text-left pb-2 text-xs text-gray-400 font-semibold uppercase">Categoría</th>
                    <th className="text-right pb-2 text-xs text-gray-400 font-semibold uppercase">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {datos.gastos.slice(0, 5).map((g) => (
                    <tr key={g.id}>
                      <td className="py-2.5 text-gray-700 truncate max-w-[150px]">{g.descripcion}</td>
                      <td className="py-2.5 text-gray-500">{g.categoria}</td>
                      <td className="py-2.5 text-right font-medium text-gray-800">{fmt(g.monto)}</td>
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
