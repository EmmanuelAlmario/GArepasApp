import { useSearchParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import TabNav from '../components/TabNav'
import Insumos from './Insumos'
import Productos from './Productos'
import Recetas from './Recetas'
import Gastos from './Gastos'
import Empleados from './Empleados'
import Usuarios from './Usuarios'

const TABS = [
  { value: 'insumos', label: 'Insumos' },
  { value: 'productos', label: 'Productos' },
  { value: 'recetas', label: 'Recetas' },
  { value: 'gastos', label: 'Gastos' },
  { value: 'empleados', label: 'Empleados' },
  { value: 'usuarios', label: 'Usuarios' },
]

export default function Gestion() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'insumos'

  const setTab = (next) => setParams({ tab: next })

  return (
    <div>
      <PageHeader title="Centro de Gestion" />
      <TabNav tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'insumos' && <Insumos embedded />}
      {tab === 'productos' && <Productos embedded />}
      {tab === 'recetas' && <Recetas embedded />}
      {tab === 'gastos' && <Gastos embedded />}
      {tab === 'empleados' && <Empleados embedded />}
      {tab === 'usuarios' && <Usuarios embedded />}
    </div>
  )
}
