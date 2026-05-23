import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../services/supabase'
import { checkoutOrder, createOrder, syncCartOrder, type OrderResponse } from '../services/orders'

export interface CartItem {
  id: number
  name: string
  price: number
  img: string
  category: string
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  addItem: (product: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: number) => void
  decrementItem: (id: number) => void
  clearCart: () => void
  checkout: () => Promise<OrderResponse>
  total: number
  count: number
  isOpen: boolean
  isCheckingOut: boolean
  checkoutError: string | null
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const CART_COOKIE_KEY = 'lojinha_cart'
const CART_COOKIE_TTL_SECONDS = 60 * 60 * 24 * 14

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`
}

function getCookie(name: string): string | null {
  const cookieParts = document.cookie ? document.cookie.split('; ') : []
  for (const part of cookieParts) {
    if (part.startsWith(`${name}=`)) {
      return decodeURIComponent(part.slice(name.length + 1))
    }
  }
  return null
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`
}

function loadFromCookie(): CartItem[] {
  try {
    const raw = getCookie(CART_COOKIE_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadFromCookie)
  const [isOpen, setIsOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [draftOrderId, setDraftOrderId] = useState<number | null>(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  useEffect(() => {
    if (items.length === 0) {
      deleteCookie(CART_COOKIE_KEY)
      return
    }

    setCookie(CART_COOKIE_KEY, JSON.stringify(items), CART_COOKIE_TTL_SECONDS)
  }, [items])

  useEffect(() => {
    async function loadUser() {
      const { data, error } = await supabase.auth.getUser()
      if (error) {
        setUserId(null)
        return
      }
      setUserId(data.user?.id ?? null)
    }

    void loadUser()

    const { data: authSubscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null)
    })

    return () => {
      authSubscription.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    async function syncLoggedUserCart() {
      if (!userId) {
        setDraftOrderId(null)
        return
      }

      if (items.length === 0) {
        return
      }

      try {
        const synced = await syncCartOrder({
          user_id: userId,
          items: items.map((item) => ({
            product_id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            img: item.img,
            category: item.category,
          })),
        })
        setDraftOrderId(synced.id)
      } catch (error) {
        console.error('Falha ao sincronizar carrinho com o pedido em aberto:', error)
      }
    }

    void syncLoggedUserCart()
  }, [items, userId])

  function addItem(product: Omit<CartItem, 'quantity'>) {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  function removeItem(id: number) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  function decrementItem(id: number) {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    )
  }

  function clearCart() {
    setItems([])
    setDraftOrderId(null)
  }

  async function checkout(): Promise<OrderResponse> {
    if (items.length === 0) {
      throw new Error('Carrinho vazio')
    }

    setIsCheckingOut(true)
    setCheckoutError(null)

    try {
      const payloadItems = items.map((item) => ({
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        img: item.img,
        category: item.category,
      }))

      let result: OrderResponse
      if (userId && draftOrderId) {
        result = await checkoutOrder(draftOrderId, 'aguardando_pagamento')
      } else {
        result = await createOrder({
          user_id: userId ?? undefined,
          status: 'aguardando_pagamento',
          items: payloadItems,
        })
      }

      setItems([])
      setDraftOrderId(null)
      setIsOpen(false)
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao finalizar compra'
      setCheckoutError(message)
      throw error
    } finally {
      setIsCheckingOut(false)
    }
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        decrementItem,
        clearCart,
        checkout,
        total,
        count,
        isOpen,
        isCheckingOut,
        checkoutError,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
