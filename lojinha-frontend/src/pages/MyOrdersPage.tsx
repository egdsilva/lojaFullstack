import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/landing/Navbar'
import Footer from '../components/landing/Footer'
import { listOrdersByUser, type OrderSummary } from '../services/orders'
import { supabase } from '../services/supabase'

const statusLabel: Record<string, string> = {
  carrinho: 'Carrinho',
  aguardando_pagamento: 'Aguardando pagamento',
  pago: 'Pago',
  em_transporte: 'Em transporte',
  entregue: 'Entregue',
}

const statusStyle: Record<string, string> = {
  carrinho: 'bg-gray-100 text-gray-700',
  aguardando_pagamento: 'bg-amber-100 text-amber-800',
  pago: 'bg-emerald-100 text-emerald-800',
  em_transporte: 'bg-sky-100 text-sky-800',
  entregue: 'bg-lime-100 text-lime-800',
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOrders() {
      setLoading(true)
      setError(null)

      const { data, error: userError } = await supabase.auth.getUser()
      if (userError || !data.user) {
        setError('Nao foi possivel identificar o usuario logado.')
        setOrders([])
        setLoading(false)
        return
      }

      try {
        const result = await listOrdersByUser(data.user.id)
        setOrders(result)
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : 'Erro ao carregar pedidos'
        setError(message)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    void loadOrders()
  }, [])

  const visibleOrders = useMemo(
    () => orders.filter((order) => order.status !== 'carrinho'),
    [orders]
  )

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">Meus pedidos</h1>
            <p className="text-sm text-gray-500 mt-2">Acompanhe o status das suas compras em tempo real.</p>
          </div>
          <Link
            to="/account"
            className="text-sm font-semibold border-2 border-emerald-700 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-700 hover:text-white transition-colors"
          >
            Voltar para minha conta
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-sm text-gray-500">Carregando pedidos...</div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-rose-100 p-8 text-sm text-rose-600 font-medium">{error}</div>
        ) : visibleOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <p className="text-sm text-gray-600">Voce ainda nao tem pedidos finalizados.</p>
            <Link
              to="/products"
              className="inline-block mt-4 text-sm font-semibold bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors"
            >
              Ir para o catalogo
            </Link>
          </div>
        ) : (
          <ul className="grid gap-4">
            {visibleOrders.map((order) => (
              <li key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm text-gray-400">Pedido #{order.id}</p>
                    <p className="text-base font-bold text-gray-800 mt-1">
                      {Number(order.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusStyle[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {statusLabel[order.status] ?? order.status}
                  </span>
                </div>

                <p className="text-xs text-gray-400 mt-3">
                  Criado em {new Date(order.created_at).toLocaleString('pt-BR')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>

      <Footer />
    </div>
  )
}
