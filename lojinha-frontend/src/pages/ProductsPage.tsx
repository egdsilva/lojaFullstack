import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/landing/Navbar'
import Footer from '../components/landing/Footer'
import { useCart } from '../context/CartContext'
import { supabase } from '../services/supabase'

type Product = {
  id: number
  name: string
  price: number
  category: string
  img: string
  badge: string | null
}

const sortOptions = [
  { label: 'Relevância', value: 'default' },
  { label: 'Menor preço', value: 'price-asc' },
  { label: 'Maior preço', value: 'price-desc' },
  { label: 'Nome A-Z', value: 'name-asc' },
]

const badgeColors: Record<string, string> = {
  'Mais vendido': 'bg-amber-400 text-emerald-900',
  'Novo': 'bg-emerald-500 text-white',
  'Promoção': 'bg-rose-500 text-white',
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')
  const [sort, setSort] = useState('default')
  const [added, setAdded] = useState<number | null>(null)
  const { addItem, openCart } = useCart()

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      setLoadError(null)

      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, category, img, badge')
        .order('id', { ascending: true })

      if (error) {
        setLoadError(error.message)
        setProducts([])
      } else {
        setProducts((data as Product[]) ?? [])
      }

      setLoading(false)
    }

    void loadProducts()
  }, [])

  const categories = useMemo(() => {
    const fromProducts = Array.from(new Set(products.map((p) => p.category))).sort((a, b) =>
      a.localeCompare(b)
    )
    return ['Todos', ...fromProducts]
  }, [products])

  function handleAddToCart(product: Product) {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      img: product.img,
      category: product.category,
    })
    setAdded(product.id)
    setTimeout(() => setAdded(null), 1500)
  }

  const filtered = products
    .filter((p) => category === 'Todos' || p.category === category)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price
      if (sort === 'price-desc') return b.price - a.price
      if (sort === 'name-asc') return a.name.localeCompare(b.name)
      return 0
    })

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-br from-emerald-800 to-emerald-700 text-white px-6 py-14 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">Catálogo de Produtos</h1>
        <p className="text-white/80 text-base max-w-md mx-auto">
          Encontre o que você precisa com os melhores preços e entrega rápida.
        </p>
      </section>

      {/* Filters */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
            />
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-sm font-semibold px-4 py-2 rounded-lg border-2 transition-all ${
                  category === cat
                    ? 'border-emerald-700 bg-emerald-700 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-emerald-600 hover:text-emerald-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-gray-700"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <h3 className="text-xl font-bold text-gray-700 mb-2">Carregando produtos...</h3>
            <p className="text-gray-400 text-sm">Aguarde alguns segundos.</p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <h3 className="text-xl font-bold text-gray-700 mb-2">Erro ao carregar produtos</h3>
            <p className="text-gray-400 text-sm max-w-lg">{loadError}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-6xl mb-4">🔍</span>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-400 text-sm">Tente buscar por outro termo ou categoria.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-6">
              {filtered.length} produto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filtered.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-md transition-all group"
                >
                  <div className="relative">
                    <img
                      src={product.img}
                      alt={product.name}
                      className="w-full aspect-square object-cover"
                    />
                    {product.badge && badgeColors[product.badge] && (
                      <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full ${badgeColors[product.badge]}`}>
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex flex-col gap-3">
                    <div>
                      <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{product.category}</span>
                      <h3 className="font-bold text-gray-800 text-base mt-0.5">{product.name}</h3>
                    </div>
                    <span className="text-xl font-extrabold text-amber-600">
                      {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className={`flex-1 text-sm font-semibold px-4 py-2 rounded-lg transition-all ${
                          added === product.id
                            ? 'bg-emerald-500 text-white scale-95'
                            : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        }`}
                      >
                        {added === product.id ? '✓ Adicionado!' : 'Adicionar ao carrinho'}
                      </button>
                      <button
                        onClick={openCart}
                        aria-label="Ver carrinho"
                        className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-emerald-200 hover:border-emerald-700 text-emerald-700 transition-all text-base"
                      >
                        🛒
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Back to top / CTA */}
      <div className="bg-emerald-50 border-t border-emerald-100 py-10 text-center">
        <p className="text-gray-500 text-sm mb-4">Não encontrou o que procurava?</p>
        <Link
          to="/"
          className="inline-block text-sm font-semibold border-2 border-emerald-700 text-emerald-700 px-6 py-2.5 rounded-xl hover:bg-emerald-700 hover:text-white transition-all"
        >
          ← Voltar para o início
        </Link>
      </div>

      <Footer />
    </div>
  )
}
