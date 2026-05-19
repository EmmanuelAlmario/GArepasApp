export default function MetricCard({ label, value, sub, color = 'blue' }) {
  const bar = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${bar[color]}`} />
      <p className="text-xs text-gray-400 font-semibold tracking-wide uppercase mb-2">{label}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}