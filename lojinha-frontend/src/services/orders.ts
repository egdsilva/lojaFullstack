import { authedApiRequest } from './api'

export type OrderStatus =
  | 'carrinho'
  | 'pago'
  | 'aguardando_pagamento'
  | 'em_transporte'
  | 'entregue'

export type OrderItemPayload = {
  product_id: number
  name: string
  price: number
  quantity: number
  img: string
  category: string
}

export type OrderResponse = {
  id: number
  user_id: string | null
  status: OrderStatus
  total: number
  created_at: string
  updated_at: string
  items: Array<{
    id: number
    order_id: number
    product_id: number
    name: string
    price: number
    quantity: number
    img: string
    category: string
  }>
}

export type OrderSummary = {
  id: number
  user_id: string | null
  status: OrderStatus
  total: number
  created_at: string
  updated_at: string
}

export async function createOrder(payload: {
  user_id?: string
  status?: OrderStatus
  items: OrderItemPayload[]
}): Promise<OrderResponse> {
  return authedApiRequest<OrderResponse>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function syncCartOrder(payload: {
  user_id: string
  items: OrderItemPayload[]
}): Promise<OrderResponse> {
  return authedApiRequest<OrderResponse>('/api/orders/sync-cart', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function checkoutOrder(orderId: number, status: OrderStatus = 'aguardando_pagamento'): Promise<OrderResponse> {
  return authedApiRequest<OrderResponse>(`/api/orders/${orderId}/checkout`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  })
}

export async function listOrdersByUser(userId: string): Promise<OrderSummary[]> {
  const searchParams = new URLSearchParams({ userId })
  return authedApiRequest<OrderSummary[]>(`/api/orders?${searchParams.toString()}`, {
    method: 'GET',
  })
}
