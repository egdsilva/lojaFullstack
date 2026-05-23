import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listProducts, listCategories, listAllOrders } from '../../services/admin'

type Stats = {
  products: number
  categories: number
  orders: number
}

const tiles = [
  {
    to: '/admin/products',
    icon: '📦',
    label: 'Produtos',
    description: 'Adicionar, editar e excluir produtos do catálogo.',
    border: 'border-blue-100 hover:border-blue-400',
    hover: 'group-hover:text-blue-700',
  },
  {
    to: '/admin/categories',
    icon: '🏷️',
    label: 'Categorias',
    description: 'Criar, renomear e excluir categorias.',
    border: 'border-violet-100 hover:border-violet-400',
    hover: 'group-hover:text-violet-700',
  },
  {
    to: '/admin/orders',
    icon: '🧾',
    label: 'Pedidos',
    description: 'Visualizar todos os pedidos e atualizar status.',
    border: 'border-amber-100 hover:border-amber-400',
    hover: 'group-hover:text-amber-700',
  },
]

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadStats() {
      try {
        const [products, categories, orders] = await Promise.all([
          listProducts(),
          listCategories(),
          listAllOrders(),
        ])
        setStats({
          products: products.length,
          categories: categories.length,
          orders: orders.length,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar estatísticas')
      } finally {
        setLoading(false)
      }
    }
    void loadStats()
  }, [])

  const statCards = [
    { label: 'Produtos', value: stats?.products },
    { label: 'Categorias', value: stats?.categories },
    { label: 'Pedidos', value: stats?.orders },
  ]

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto w-full">
      <h1 className="text-2xl font-extrabold text-gray-800">Dashboard</h1>
      <p className="text-sm text-gray-500 mt-1 mb-8">Visão geral da loja.</p>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
          >
            <p className="text-xs uppercase tracking-wide font-semibold text-gray-400">
              {card.label}
            </p>
            <p className="text-4xl font-extrabold text-gray-800 mt-2">
              {loading ? '—' : card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Nav tiles */}
      <h2 className="text-xs uppercase tracking-wide font-semibold text-gray-400 mb-3">
        Seções
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tiles.map((tile) => (
          <Link
            key={tile.to}
            to={tile.to}
            className={`bg-white rounded-2xl border-2 ${tile.border} shadow-sm p-6 transition-all hover:shadow-md group`}
          >
            <p className="text-4xl">{tile.icon}</p>
            <p className={`text-base font-bold text-gray-800 mt-3 transition-colors ${tile.hover}`}>
              {tile.label}
            </p>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{tile.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
