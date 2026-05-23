import { apiRequest, authedApiRequest } from './api'
import type { OrderStatus, OrderSummary } from './orders'

export type AdminProduct = {
  id: number
  name: string
  price: number
  category: string
  img: string
  badge: string | null
}

export type CategorySummary = {
  name: string
  productCount: number
}

export type ProductPayload = {
  name: string
  price: number
  category: string
  img: string
  badge?: string | null
}

export async function listProducts(): Promise<AdminProduct[]> {
  return apiRequest<AdminProduct[]>('/api/products', {
    method: 'GET',
  })
}

export async function createProduct(payload: ProductPayload): Promise<AdminProduct> {
  return authedApiRequest<AdminProduct>('/api/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateProduct(id: number, payload: Partial<ProductPayload>): Promise<AdminProduct> {
  return authedApiRequest<AdminProduct>(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteProduct(id: number): Promise<void> {
  return authedApiRequest<void>(`/api/products/${id}`, {
    method: 'DELETE',
  })
}

export async function listCategories(): Promise<CategorySummary[]> {
  return apiRequest<CategorySummary[]>('/api/products/categories', {
    method: 'GET',
  })
}

export async function createCategory(name: string): Promise<{ name: string }> {
  return authedApiRequest<{ name: string }>('/api/products/categories', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export async function renameCategory(currentName: string, name: string): Promise<{ name: string }> {
  return authedApiRequest<{ name: string }>(`/api/products/categories/${encodeURIComponent(currentName)}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  })
}

export async function removeCategory(name: string, replacementCategory?: string): Promise<void> {
  return authedApiRequest<void>(`/api/products/categories/${encodeURIComponent(name)}`, {
    method: 'DELETE',
    body: JSON.stringify({ replacementCategory }),
  })
}

export async function listAllOrders(): Promise<OrderSummary[]> {
  return authedApiRequest<OrderSummary[]>('/api/orders', {
    method: 'GET',
  })
}

export async function updateOrderStatus(orderId: number, status: OrderStatus): Promise<OrderSummary> {
  return authedApiRequest<OrderSummary>(`/api/orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}
