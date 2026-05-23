import { useEffect, useMemo, useState } from 'react'
import { listAllOrders, updateOrderStatus } from '../../services/admin'
import type { OrderStatus, OrderSummary } from '../../services/orders'

const statusLabel: Record<string, string> = {
  carrinho: 'Carrinho',
  aguardando_pagamento: 'Aguardando pagamento',
  pago: 'Pago',
  em_transporte: 'Em transporte',
  entregue: 'Entregue',
}

const statusBadge: Record<string, string> = {
  carrinho: 'bg-gray-100 text-gray-600',
  aguardando_pagamento: 'bg-yellow-100 text-yellow-700',
  pago: 'bg-emerald-100 text-emerald-700',
  em_transporte: 'bg-blue-100 text-blue-700',
  entregue: 'bg-indigo-100 text-indigo-700',
}

const orderStatusOptions: OrderStatus[] = [
  'carrinho',
  'aguardando_pagamento',
  'pago',
  'em_transporte',
  'entregue',
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<number, OrderStatus>>({})
  const [savingId, setSavingId] = useState<number | null>(null)

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const result = await listAllOrders()
      setOrders(result)
      setDrafts(
        Object.fromEntries(result.map((o) => [o.id, o.status])) as Record<number, OrderStatus>
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => b.id - a.id),
    [orders]
  )

  async function handleSaveStatus(orderId: number) {
    const next = drafts[orderId]
    const current = orders.find((o) => o.id === orderId)
    if (!next || !current || current.status === next) return

    setSavingId(orderId)
    setError(null)
    try {
      await updateOrderStatus(orderId, next)
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: next } : o))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status do pedido')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
      <h1 className="text-2xl font-extrabold text-gray-800">Pedidos</h1>
      <p className="text-sm text-gray-500 mt-0.5 mb-6">Todos os pedidos da loja.</p>

      {error && (
        <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-gray-500">Carregando pedidos...</p>
        ) : sortedOrders.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">Nenhum pedido encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Pedido</th>
                  <th className="px-4 py-3">Usuário</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Criado em</th>
                  <th className="px-4 py-3">Alterar status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-gray-700">#{order.id}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs max-w-[160px] truncate">
                      {order.user_id ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge[order.status] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {statusLabel[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-700">
                      {Number(order.total).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(order.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={drafts[order.id] ?? order.status}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [order.id]: e.target.value as OrderStatus,
                            }))
                          }
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          {orderStatusOptions.map((s) => (
                            <option key={s} value={s}>
                              {statusLabel[s]}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            void handleSaveStatus(order.id)
                          }}
                          disabled={
                            savingId === order.id ||
                            (drafts[order.id] ?? order.status) === order.status
                          }
                          className="text-xs font-semibold bg-emerald-700 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          {savingId === order.id ? '...' : 'Salvar'}
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
