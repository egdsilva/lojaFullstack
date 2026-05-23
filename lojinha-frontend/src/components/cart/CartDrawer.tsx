import { useState } from 'react'
import { useCart } from '../../context/CartContext'

export default function CartDrawer() {
  const {
    items,
    removeItem,
    decrementItem,
    addItem,
    clearCart,
    checkout,
    total,
    count,
    isOpen,
    isCheckingOut,
    checkoutError,
    closeCart,
  } = useCart()
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null)

  async function handleCheckout() {
    setCheckoutSuccess(null)
    try {
      const order = await checkout()
      setCheckoutSuccess(`Pedido #${order.id} criado! Status: ${order.status}.`)
    } catch {
      // checkoutError ja vem do contexto
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <h2 className="font-extrabold text-gray-800 text-lg">Carrinho</h2>
            {count > 0 && (
              <span className="bg-emerald-700 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            aria-label="Fechar carrinho"
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 pb-8">
              <span className="text-6xl">🛒</span>
              <p className="font-bold text-gray-700 text-lg">Seu carrinho está vazio</p>
              <p className="text-sm text-gray-400">Adicione produtos para continuar.</p>
              <button
                onClick={closeCart}
                className="mt-2 text-sm font-semibold border-2 border-emerald-700 text-emerald-700 px-5 py-2 rounded-lg hover:bg-emerald-700 hover:text-white transition-all"
              >
                Explorar produtos
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-4 bg-gray-50 rounded-xl p-3"
                >
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 mb-1">{item.category}</p>
                    <span className="text-amber-600 font-extrabold text-sm">
                      {(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => decrementItem(item.id)}
                      aria-label="Diminuir quantidade"
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:border-rose-400 hover:text-rose-500 text-gray-500 font-bold transition-colors text-sm"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-gray-700">{item.quantity}</span>
                    <button
                      onClick={() => addItem({ id: item.id, name: item.name, price: item.price, img: item.img, category: item.category })}
                      aria-label="Aumentar quantidade"
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 text-gray-500 font-bold transition-colors text-sm"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remover ${item.name}`}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 text-gray-300 hover:text-rose-500 transition-colors ml-1"
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-medium">Total</span>
              <span className="text-xl font-extrabold text-emerald-700">
                {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            {checkoutError && (
              <p className="text-xs font-medium text-rose-600">{checkoutError}</p>
            )}
            {checkoutSuccess && (
              <p className="text-xs font-medium text-emerald-700">{checkoutSuccess}</p>
            )}
            <button
              onClick={() => {
                void handleCheckout()
              }}
              disabled={isCheckingOut}
              className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all text-sm shadow"
            >
              {isCheckingOut ? 'Finalizando...' : 'Finalizar compra'}
            </button>
            <button
              onClick={clearCart}
              className="w-full text-sm text-gray-400 hover:text-rose-500 transition-colors py-1"
            >
              Limpar carrinho
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
