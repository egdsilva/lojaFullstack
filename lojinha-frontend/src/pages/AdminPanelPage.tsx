import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/landing/Navbar'
import Footer from '../components/landing/Footer'
import {
  createCategory,
  createProduct,
  deleteProduct,
  listAllOrders,
  listCategories,
  listProducts,
  removeCategory,
  renameCategory,
  updateOrderStatus,
  updateProduct,
  type AdminProduct,
  type CategorySummary,
} from '../services/admin'
import type { OrderStatus, OrderSummary } from '../services/orders'

const statusLabel: Record<string, string> = {
  carrinho: 'Carrinho',
  aguardando_pagamento: 'Aguardando pagamento',
  pago: 'Pago',
  em_transporte: 'Em transporte',
  entregue: 'Entregue',
}

const orderStatusOptions: OrderStatus[] = [
  'carrinho',
  'aguardando_pagamento',
  'pago',
  'em_transporte',
  'entregue',
]

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

export default function AdminPanelPage() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [categories, setCategories] = useState<CategorySummary[]>([])
  const [orders, setOrders] = useState<OrderSummary[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<ProductFormState>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [savingProduct, setSavingProduct] = useState(false)

  const [newCategory, setNewCategory] = useState('')
  const [savingCategory, setSavingCategory] = useState(false)
  const [orderStatusDrafts, setOrderStatusDrafts] = useState<Record<number, OrderStatus>>({})
  const [savingOrderId, setSavingOrderId] = useState<number | null>(null)

  async function loadAll() {
    setLoading(true)
    setError(null)

    try {
      const [productsResult, categoriesResult, ordersResult] = await Promise.all([
        listProducts(),
        listCategories(),
        listAllOrders(),
      ])

      setProducts(productsResult)
      setCategories(categoriesResult)
      setOrders(ordersResult)
      setOrderStatusDrafts(
        Object.fromEntries(ordersResult.map((order) => [order.id, order.status])) as Record<number, OrderStatus>
      )
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Erro ao carregar dados do painel'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAll()
  }, [])

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.id - b.id),
    [products]
  )

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => b.id - a.id),
    [orders]
  )

  function resetProductForm() {
    setForm(emptyForm)
    setEditingId(null)
  }

  function startEditProduct(product: AdminProduct) {
    setEditingId(product.id)
    setForm({
      name: product.name,
      price: String(product.price),
      category: product.category,
      img: product.img,
      badge: product.badge ?? '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedName = form.name.trim()
    const normalizedCategory = form.category.trim()
    const normalizedImg = form.img.trim()
    const normalizedPrice = Number(form.price)
    const normalizedBadge = form.badge.trim()

    if (!normalizedName || !normalizedCategory || !normalizedImg || !Number.isFinite(normalizedPrice)) {
      setError('Preencha nome, categoria, imagem e preco validos.')
      return
    }

    setSavingProduct(true)
    setError(null)

    try {
      if (editingId) {
        await updateProduct(editingId, {
          name: normalizedName,
          category: normalizedCategory,
          img: normalizedImg,
          price: normalizedPrice,
          badge: normalizedBadge || null,
        })
      } else {
        await createProduct({
          name: normalizedName,
          category: normalizedCategory,
          img: normalizedImg,
          price: normalizedPrice,
          badge: normalizedBadge || null,
        })
      }

      resetProductForm()
      await loadAll()
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Erro ao salvar produto'
      setError(message)
    } finally {
      setSavingProduct(false)
    }
  }

  async function handleDeleteProduct(productId: number) {
    const confirmed = window.confirm('Deseja excluir este produto?')
    if (!confirmed) return

    setError(null)

    try {
      await deleteProduct(productId)
      await loadAll()
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Erro ao excluir produto'
      setError(message)
    }
  }

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalized = newCategory.trim()
    if (!normalized) {
      setError('Informe um nome de categoria.')
      return
    }

    setSavingCategory(true)
    setError(null)

    try {
      await createCategory(normalized)
      setNewCategory('')
      await loadAll()
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Erro ao criar categoria'
      setError(message)
    } finally {
      setSavingCategory(false)
    }
  }

  async function handleRenameCategory(currentName: string) {
    const newName = window.prompt(`Novo nome para a categoria "${currentName}"`, currentName)
    if (!newName || newName.trim() === currentName) return

    setError(null)

    try {
      await renameCategory(currentName, newName.trim())
      await loadAll()
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Erro ao renomear categoria'
      setError(message)
    }
  }

  async function handleDeleteCategory(category: CategorySummary) {
    let replacementCategory: string | undefined

    if (category.productCount > 0) {
      const replacement = window.prompt(
        `A categoria "${category.name}" possui ${category.productCount} produto(s). Informe uma categoria de destino para mover esses produtos:`,
        ''
      )

      if (!replacement || !replacement.trim()) {
        setError('A categoria possui produtos. Informe uma categoria destino para excluir.')
        return
      }

      replacementCategory = replacement.trim()
    }

    const confirmed = window.confirm(`Deseja excluir a categoria "${category.name}"?`)
    if (!confirmed) return

    setError(null)

    try {
      await removeCategory(category.name, replacementCategory)
      await loadAll()
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Erro ao excluir categoria'
      setError(message)
    }
  }

  async function handleUpdateOrderStatus(orderId: number) {
    const nextStatus = orderStatusDrafts[orderId]
    const currentOrder = orders.find((order) => order.id === orderId)

    if (!nextStatus || !currentOrder || currentOrder.status === nextStatus) {
      return
    }

    setError(null)
    setSavingOrderId(orderId)

    try {
      await updateOrderStatus(orderId, nextStatus)

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: nextStatus,
              }
            : order
        )
      )
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Erro ao atualizar status do pedido'
      setError(message)
    } finally {
      setSavingOrderId(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">Painel administrativo</h1>
            <p className="text-sm text-gray-500 mt-2">
              Gerencie produtos, categorias e visualize todos os pedidos da loja.
            </p>
          </div>
          <Link
            to="/account"
            className="text-sm font-semibold border-2 border-emerald-700 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-700 hover:text-white transition-colors"
          >
            Voltar para minha conta
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-sm text-gray-500">
            Carregando painel...
          </div>
        ) : (
          <div className="grid gap-6">
            <section className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingId ? `Editar produto #${editingId}` : 'Adicionar produto'}
              </h2>

              <form onSubmit={handleSubmitProduct} className="grid md:grid-cols-2 gap-4">
                <label className="text-sm font-semibold text-gray-700">
                  Nome
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </label>

                <label className="text-sm font-semibold text-gray-700">
                  Preco
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </label>

                <label className="text-sm font-semibold text-gray-700">
                  Categoria
                  <input
                    type="text"
                    list="admin-categories"
                    value={form.category}
                    onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </label>

                <label className="text-sm font-semibold text-gray-700">
                  Badge
                  <input
                    type="text"
                    value={form.badge}
                    onChange={(event) => setForm((prev) => ({ ...prev, badge: event.target.value }))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    placeholder="Ex: Novo"
                  />
                </label>

                <label className="text-sm font-semibold text-gray-700 md:col-span-2">
                  URL da imagem
                  <input
                    type="text"
                    value={form.img}
                    onChange={(event) => setForm((prev) => ({ ...prev, img: event.target.value }))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </label>

                <div className="md:col-span-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={savingProduct}
                    className="bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-emerald-800 disabled:bg-emerald-400"
                  >
                    {savingProduct
                      ? 'Salvando...'
                      : editingId
                        ? 'Salvar alteracoes'
                        : 'Adicionar produto'}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      onClick={resetProductForm}
                      className="border border-gray-300 text-gray-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-100"
                    >
                      Cancelar edicao
                    </button>
                  )}
                </div>
              </form>

              <datalist id="admin-categories">
                {categories.map((item) => (
                  <option key={item.name} value={item.name} />
                ))}
              </datalist>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Categorias</h2>

              <form onSubmit={handleCreateCategory} className="flex gap-3 flex-wrap mb-4">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(event) => setNewCategory(event.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm min-w-[220px]"
                  placeholder="Nova categoria"
                  required
                />
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="bg-gray-800 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-900 disabled:bg-gray-400"
                >
                  {savingCategory ? 'Salvando...' : 'Adicionar categoria'}
                </button>
              </form>

              <ul className="grid gap-2">
                {categories.map((item) => (
                  <li
                    key={item.name}
                    className="border border-gray-100 rounded-lg px-3 py-2 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.productCount} produto(s)</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          void handleRenameCategory(item.name)
                        }}
                        className="text-xs font-semibold border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                      >
                        Renomear
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void handleDeleteCategory(item)
                        }}
                        className="text-xs font-semibold border border-rose-300 text-rose-700 px-3 py-1.5 rounded-lg hover:bg-rose-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 p-6 overflow-x-auto">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Produtos cadastrados</h2>

              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200 text-gray-500 uppercase text-xs">
                    <th className="py-2 pr-3">ID</th>
                    <th className="py-2 pr-3">Nome</th>
                    <th className="py-2 pr-3">Categoria</th>
                    <th className="py-2 pr-3">Preco</th>
                    <th className="py-2 pr-3">Badge</th>
                    <th className="py-2 pr-3">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProducts.map((product) => (
                    <tr key={product.id} className="border-b border-gray-100">
                      <td className="py-2 pr-3 text-gray-500">{product.id}</td>
                      <td className="py-2 pr-3 font-semibold text-gray-800">{product.name}</td>
                      <td className="py-2 pr-3 text-gray-600">{product.category}</td>
                      <td className="py-2 pr-3 text-gray-600">
                        {Number(product.price).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </td>
                      <td className="py-2 pr-3 text-gray-500">{product.badge ?? '-'}</td>
                      <td className="py-2 pr-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEditProduct(product)}
                            className="text-xs font-semibold border border-gray-300 text-gray-700 px-2.5 py-1 rounded-lg hover:bg-gray-50"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              void handleDeleteProduct(product.id)
                            }}
                            className="text-xs font-semibold border border-rose-300 text-rose-700 px-2.5 py-1 rounded-lg hover:bg-rose-50"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 p-6 overflow-x-auto">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Todos os pedidos da loja</h2>

              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200 text-gray-500 uppercase text-xs">
                    <th className="py-2 pr-3">Pedido</th>
                    <th className="py-2 pr-3">Usuario</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Total</th>
                    <th className="py-2 pr-3">Criado em</th>
                    <th className="py-2 pr-3">Atualizar status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100">
                      <td className="py-2 pr-3 font-semibold text-gray-700">#{order.id}</td>
                      <td className="py-2 pr-3 text-gray-500">{order.user_id ?? 'sem usuario'}</td>
                      <td className="py-2 pr-3 text-gray-600">
                        {statusLabel[order.status] ?? order.status}
                      </td>
                      <td className="py-2 pr-3 text-gray-600">
                        {Number(order.total).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </td>
                      <td className="py-2 pr-3 text-gray-500">
                        {new Date(order.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2">
                          <select
                            value={orderStatusDrafts[order.id] ?? order.status}
                            onChange={(event) =>
                              setOrderStatusDrafts((prev) => ({
                                ...prev,
                                [order.id]: event.target.value as OrderStatus,
                              }))
                            }
                            className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-700"
                          >
                            {orderStatusOptions.map((status) => (
                              <option key={status} value={status}>
                                {statusLabel[status]}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              void handleUpdateOrderStatus(order.id)
                            }}
                            disabled={savingOrderId === order.id || (orderStatusDrafts[order.id] ?? order.status) === order.status}
                            className="text-xs font-semibold bg-emerald-700 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-800 disabled:bg-emerald-300 disabled:cursor-not-allowed"
                          >
                            {savingOrderId === order.id ? 'Salvando...' : 'Salvar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
