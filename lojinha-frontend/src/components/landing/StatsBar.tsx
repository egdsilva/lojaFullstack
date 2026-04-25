const stats = [
  { value: '500+', label: 'Produtos' },
  { value: '10 mil+', label: 'Clientes felizes' },
  { value: '4.9 ⭐', label: 'Avaliação média' },
  { value: '24h', label: 'Suporte' },
]

export default function StatsBar() {
  return (
    <div className="flex border-b border-gray-100 bg-white">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`flex-1 flex flex-col items-center py-6 ${i < stats.length - 1 ? 'border-r border-gray-100' : ''}`}
        >
          <strong className="text-2xl font-extrabold text-emerald-700 leading-none">{stat.value}</strong>
          <span className="text-xs text-gray-400 mt-1">{stat.label}</span>
        </div>
      ))}
    </div>
  )
}
