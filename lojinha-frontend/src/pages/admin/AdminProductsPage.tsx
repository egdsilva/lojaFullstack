import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  listProducts,
  listCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  type AdminProduct,
  type CategorySummary,
  type ProductPayload,
} from '../../services/admin'

type ProductFormState = {
  name: string
  price: string
  category: string
  img: string
  badge: string
}

const emptyForm: ProductFormState = {
  name: '',
  price: '',
  category: '',
  img: '',
  badge: '',
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [categories, setCategories] = useState<CategorySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<ProductFormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [productsResult, categoriesResult] = await Promise.all([
        listProducts(),
        listCategories(),
      ])
      setProducts(productsResult)
      setCategories(categoriesResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.id - b.id),
    [products]
  )

  function openAddForm() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openEditForm(product: AdminProduct) {
    setEditingId(product.id)
    setForm({
      name: product.name,
      price: String(product.price),
      category: product.category,
      img: product.img,
      badge: product.badge ?? '',
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelForm() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(false)
    setError(null)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const name = form.name.trim()
    const category = form.category.trim()
    const img = form.img.trim()
    const price = Number(form.price)
    const badge = form.badge.trim() || null

    if (!name || !category || !img || !Number.isFinite(price) || price < 0) {
      setError('Preencha todos os campos obrigatórios com valores válidos.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const payload: ProductPayload = { name, category, img, price, badge }
      if (editingId) {
        await updateProduct(editingId, payload)
      } else {
        await createProduct(payload)
      }
      cancelForm()
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar produto')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Deseja excluir este produto?')) return
    setError(null)
    try {
      await deleteProduct(id)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir produto')
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Produtos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerencie o catálogo da loja.</p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={openAddForm}
            className="shrink-0 bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-emerald-800 transition-colors text-sm"
          >
            + Adicionar produto
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-base font-bold text-gray-800 mb-4">
            {editingId ? `Editar produto #${editingId}` : 'Novo produto'}
          </h2>

          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
              Nome *
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
              Preço (R$) *
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
              Categoria *
              <input
                type="text"
                list="form-categories"
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
              <datalist id="form-categories">
                {categories.map((c) => (
                  <option key={c.name} value={c.name} />
                ))}
              </datalist>
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
              Badge
              <input
                type="text"
                value={form.badge}
                onChange={(e) => setForm((p) => ({ ...p, badge: e.target.value }))}
                placeholder="Ex: Novo, Oferta..."
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700 md:col-span-2">
              URL da imagem *
              <input
                type="text"
                value={form.img}
                onChange={(e) => setForm((p) => ({ ...p, img: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </label>

            <div className="md:col-span-2 flex gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-emerald-800 disabled:opacity-60 text-sm transition-colors"
              >
                {saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Adicionar produto'}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="border border-gray-200 text-gray-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-50 text-sm transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-gray-500">Carregando produtos...</p>
        ) : sortedProducts.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">Nenhum produto cadastrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 w-12">ID</th>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Preço</th>
                  <th className="px-4 py-3">Badge</th>
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-gray-400">{product.id}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{product.name}</td>
                    <td className="px-4 py-3">
                      <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {Number(product.price).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {product.badge ? (
                        <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                          {product.badge}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(product)}
                          className="text-xs font-semibold border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void handleDelete(product.id)
                          }}
                          className="text-xs font-semibold border border-rose-200 text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
