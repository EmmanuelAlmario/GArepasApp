import { useEffect, useState } from 'react'
import MetricCard from '../components/MetricCard'
import PageHeader from '../components/PageHeader'
import { getInsumos } from '../api/insumos'
import { getProductos } from '../api/productos'
import { getVentas } from '../api/ventas'
import { getGastos } from '../api/gastos'

export default function Dashboard() {
  const [datos, setDatos] = useState({
    insumos: [],
    productos: [],
    ventas: [],
    gastos: [],
  })

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
  const rentabilidad = totalVentas - totalGastos
  const productosActivos = datos.productos.filter((p) => p.activo).length

  const fmt = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

  return (
    <div>
      <PageHeader title="Dashboard" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Ingresos totales" value={fmt(totalVentas)} sub="Suma de ventas" color="blue" />
        <MetricCard label="Gastos totales" value={fmt(totalGastos)} sub="Suma de gastos" color="red" />
        <MetricCard label="Rentabilidad" value={fmt(rentabilidad)} sub="Ingresos - Gastos" color="green" />
        <MetricCard label="Productos activos" value={productosActivos} sub="En catálogo" color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Últimas ventas</h3>
          {datos.ventas.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Sin ventas registradas</p>
          ) : (
            <table className="w-full text-sm">
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
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Insumos</h3>
          {datos.insumos.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Sin insumos registrados</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-2 text-xs text-gray-400 font-semibold uppercase">Nombre</th>
                  <th className="text-left pb-2 text-xs text-gray-400 font-semibold uppercase">Categoría</th>
                  <th className="text-right pb-2 text-xs text-gray-400 font-semibold uppercase">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {datos.insumos.slice(0, 5).map((ins) => (
                  <tr key={ins.id}>
                    <td className="py-2.5 text-gray-700">{ins.nombre}</td>
                    <td className="py-2.5 text-gray-500">{ins.categoria}</td>
                    <td className="py-2.5 text-right font-medium text-gray-800">
                      {ins.stockActual} {ins.unidadMedida}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}