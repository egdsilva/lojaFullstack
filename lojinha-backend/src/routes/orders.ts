import { Router, Request, Response } from 'express'
import { supabase } from '../config/supabase.js'
import { requireAuth } from '../middlewares/auth.js'

const router = Router()

type OrderStatus = 'carrinho' | 'pago' | 'aguardando_pagamento' | 'em_transporte' | 'entregue'

type OrderItemInput = {
  product_id: number
  name: string
  price: number
  quantity: number
  img: string
  category: string
}

type OrderInput = {
  user_id?: string | null
  status?: OrderStatus
  items: OrderItemInput[]
}

const ALLOWED_STATUS: OrderStatus[] = [
  'carrinho',
  'pago',
  'aguardando_pagamento',
  'em_transporte',
  'entregue',
]

function isValidStatus(status: unknown): status is OrderStatus {
  return typeof status === 'string' && ALLOWED_STATUS.includes(status as OrderStatus)
}

function isValidItem(item: unknown): item is OrderItemInput {
  if (!item || typeof item !== 'object') return false
  const candidate = item as Partial<OrderItemInput>
  const quantity = candidate.quantity
  return (
    Number.isFinite(candidate.product_id) &&
    typeof candidate.name === 'string' &&
    Number.isFinite(candidate.price) &&
    Number.isFinite(quantity) &&
    (quantity ?? 0) > 0 &&
    typeof candidate.img === 'string' &&
    typeof candidate.category === 'string'
  )
}

function sanitizeItems(items: OrderItemInput[]) {
  return items.map((item) => ({
    product_id: item.product_id,
    name: item.name,
    price: Number(item.price),
    quantity: Number(item.quantity),
    img: item.img,
    category: item.category,
  }))
}

function calculateTotal(items: OrderItemInput[]): number {
  return Number(
    items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0).toFixed(2)
  )
}

async function replaceOrderItems(orderId: number, items: OrderItemInput[]) {
  const { error: deleteError } = await supabase.from('order_items').delete().eq('order_id', orderId)
  if (deleteError) {
    return { error: deleteError }
  }

  if (items.length === 0) {
    return { error: null }
  }

  const rows = items.map((item) => ({
    order_id: orderId,
    product_id: item.product_id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    img: item.img,
    category: item.category,
  }))

  const { error: insertError } = await supabase.from('order_items').insert(rows)
  return { error: insertError }
}

async function fetchOrderWithItems(orderId: number) {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, user_id, status, total, created_at, updated_at')
    .eq('id', orderId)
    .maybeSingle()

  if (orderError) {
    return { data: null, error: orderError }
  }

  if (!order) {
    return { data: null, error: null }
  }

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('id, order_id, product_id, name, price, quantity, img, category')
    .eq('order_id', orderId)
    .order('id', { ascending: true })

  if (itemsError) {
    return { data: null, error: itemsError }
  }

  return {
    data: {
      ...order,
      items: items ?? [],
    },
    error: null,
  }
}

function getCurrentUserId(req: Request) {
  return req.authUser?.id ?? null
}

function canAccessOrder(req: Request, orderUserId: string | null) {
  if (req.isAdmin) return true
  const currentUserId = getCurrentUserId(req)
  if (!currentUserId) return false
  if (!orderUserId) return false
  return currentUserId === orderUserId
}

router.use(requireAuth)

// GET /api/orders
router.get('/', async (req: Request, res: Response) => {
  const status = req.query.status
  const userId = req.query.userId
  const currentUserId = getCurrentUserId(req)

  if (!currentUserId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  let query = supabase
    .from('orders')
    .select('id, user_id, status, total, created_at, updated_at')
    .order('id', { ascending: false })

  if (typeof status === 'string') {
    if (!isValidStatus(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }
    query = query.eq('status', status)
  }

  if (req.isAdmin) {
    if (typeof userId === 'string' && userId.trim().length > 0) {
      query = query.eq('user_id', userId)
    }
  } else {
    if (typeof userId === 'string' && userId.trim().length > 0 && userId !== currentUserId) {
      return res.status(403).json({ error: 'Not allowed to view other users orders' })
    }
    query = query.eq('user_id', currentUserId)
  }

  const { data, error } = await query

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  return res.json(data ?? [])
})

// GET /api/orders/:id
router.get('/:id', async (req: Request, res: Response) => {
  const id = Number.parseInt(String(req.params.id), 10)

  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid order id' })
  }

  const { data, error } = await fetchOrderWithItems(id)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  if (!data) {
    return res.status(404).json({ error: 'Order not found' })
  }

  if (!canAccessOrder(req, data.user_id)) {
    return res.status(403).json({ error: 'Not allowed to view this order' })
  }

  return res.json(data)
})

// POST /api/orders
router.post('/', async (req: Request, res: Response) => {
  const body = req.body as Partial<OrderInput>
  const status = body.status ?? 'aguardando_pagamento'
  const currentUserId = getCurrentUserId(req)
  const userId = req.isAdmin ? body.user_id ?? null : currentUserId
  const rawItems = body.items

  if (!currentUserId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item' })
  }

  if (!isValidStatus(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }

  if (!rawItems.every(isValidItem)) {
    return res.status(400).json({ error: 'Invalid order items payload' })
  }

  const items = sanitizeItems(rawItems)
  const total = calculateTotal(items)

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      status,
      total,
    })
    .select('id')
    .single()

  if (orderError || !order) {
    return res.status(500).json({ error: orderError?.message ?? 'Failed to create order' })
  }

  const { error: itemsError } = await replaceOrderItems(order.id, items)
  if (itemsError) {
    await supabase.from('orders').delete().eq('id', order.id)
    return res.status(500).json({ error: itemsError.message })
  }

  const result = await fetchOrderWithItems(order.id)
  if (result.error || !result.data) {
    return res.status(500).json({ error: result.error?.message ?? 'Failed to load order' })
  }

  return res.status(201).json(result.data)
})

// POST /api/orders/sync-cart
router.post('/sync-cart', async (req: Request, res: Response) => {
  const body = req.body as { user_id?: string; items?: OrderItemInput[] }
  const currentUserId = getCurrentUserId(req)
  const rawItems = body.items

  if (!currentUserId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  let targetUserId = currentUserId

  if (req.isAdmin) {
    if (!body.user_id || typeof body.user_id !== 'string') {
      return res.status(400).json({ error: 'user_id is required for cart sync' })
    }
    targetUserId = body.user_id
  } else if (body.user_id && body.user_id !== currentUserId) {
    return res.status(403).json({ error: 'Not allowed to sync cart for another user' })
  }

  if (!Array.isArray(rawItems)) {
    return res.status(400).json({ error: 'items must be an array' })
  }

  if (!rawItems.every(isValidItem)) {
    return res.status(400).json({ error: 'Invalid order items payload' })
  }

  const items = sanitizeItems(rawItems)
  const total = calculateTotal(items)

  const { data: existingCart, error: existingError } = await supabase
    .from('orders')
    .select('id')
    .eq('user_id', targetUserId)
    .eq('status', 'carrinho')
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingError) {
    return res.status(500).json({ error: existingError.message })
  }

  let orderId: number

  if (existingCart) {
    orderId = existingCart.id
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        total,
        status: 'carrinho',
      })
      .eq('id', orderId)

    if (updateError) {
      return res.status(500).json({ error: updateError.message })
    }
  } else {
    const { data: created, error: createError } = await supabase
      .from('orders')
      .insert({
        user_id: targetUserId,
        status: 'carrinho',
        total,
      })
      .select('id')
      .single()

    if (createError || !created) {
      return res.status(500).json({ error: createError?.message ?? 'Failed to create cart order' })
    }

    orderId = created.id
  }

  const { error: replaceError } = await replaceOrderItems(orderId, items)
  if (replaceError) {
    return res.status(500).json({ error: replaceError.message })
  }

  const result = await fetchOrderWithItems(orderId)
  if (result.error || !result.data) {
    return res.status(500).json({ error: result.error?.message ?? 'Failed to load synced cart' })
  }

  return res.json(result.data)
})

// POST /api/orders/:id/checkout
router.post('/:id/checkout', async (req: Request, res: Response) => {
  const id = Number.parseInt(String(req.params.id), 10)
  const status = req.body?.status as unknown

  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid order id' })
  }

  const finalStatus: OrderStatus = isValidStatus(status) ? status : 'aguardando_pagamento'
  if (finalStatus === 'carrinho') {
    return res.status(400).json({ error: 'Checkout status cannot be carrinho' })
  }

  const { data: existing, error: existingError } = await supabase
    .from('orders')
    .select('id, user_id')
    .eq('id', id)
    .maybeSingle()

  if (existingError) {
    return res.status(500).json({ error: existingError.message })
  }

  if (!existing) {
    return res.status(404).json({ error: 'Order not found' })
  }

  if (!canAccessOrder(req, existing.user_id)) {
    return res.status(403).json({ error: 'Not allowed to checkout this order' })
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: finalStatus })
    .eq('id', id)

  if (updateError) {
    return res.status(500).json({ error: updateError.message })
  }

  const result = await fetchOrderWithItems(id)
  if (result.error || !result.data) {
    return res.status(500).json({ error: result.error?.message ?? 'Failed to load checkout order' })
  }

  return res.json(result.data)
})

// PUT /api/orders/:id (admin)
router.put('/:id', async (req: Request, res: Response) => {
  if (!req.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' })
  }

  const id = Number.parseInt(String(req.params.id), 10)
  const body = req.body as Partial<OrderInput>

  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid order id' })
  }

  const { data: existing, error: existingError } = await supabase
    .from('orders')
    .select('id')
    .eq('id', id)
    .maybeSingle()

  if (existingError) {
    return res.status(500).json({ error: existingError.message })
  }

  if (!existing) {
    return res.status(404).json({ error: 'Order not found' })
  }

  const patch: { status?: OrderStatus; user_id?: string | null; total?: number } = {}

  if (body.status !== undefined) {
    if (!isValidStatus(body.status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }
    patch.status = body.status
  }

  if (body.user_id !== undefined) {
    patch.user_id = body.user_id
  }

  if (Array.isArray(body.items)) {
    if (!body.items.every(isValidItem)) {
      return res.status(400).json({ error: 'Invalid order items payload' })
    }
    const items = sanitizeItems(body.items)
    patch.total = calculateTotal(items)

    const { error: replaceError } = await replaceOrderItems(id, items)
    if (replaceError) {
      return res.status(500).json({ error: replaceError.message })
    }
  }

  if (Object.keys(patch).length > 0) {
    const { error: updateError } = await supabase.from('orders').update(patch).eq('id', id)
    if (updateError) {
      return res.status(500).json({ error: updateError.message })
    }
  }

  const result = await fetchOrderWithItems(id)
  if (result.error || !result.data) {
    return res.status(500).json({ error: result.error?.message ?? 'Failed to load order' })
  }

  return res.json(result.data)
})

// DELETE /api/orders/:id (admin)
router.delete('/:id', async (req: Request, res: Response) => {
  if (!req.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' })
  }

  const id = Number.parseInt(String(req.params.id), 10)

  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid order id' })
  }

  const { error } = await supabase.from('orders').delete().eq('id', id)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  return res.status(204).send()
})

export default router
