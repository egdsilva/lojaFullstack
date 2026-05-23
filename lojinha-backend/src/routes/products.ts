import { Router, Request, Response } from 'express'
import { supabase } from '../config/supabase.js'
import { requireAdmin } from '../middlewares/auth.js'

const router = Router()

type ProductRow = {
  id: number
  name: string
  price: number
  category: string
  img: string
  badge: string | null
}

type ProductPayload = {
  name?: string
  price?: number
  category?: string
  img?: string
  badge?: string | null
}

function isMissingTableError(error: { code?: string } | null) {
  return error?.code === '42P01'
}

function normalizeName(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function normalizeBadge(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function normalizePrice(value: unknown): number | null {
  if (!Number.isFinite(value)) return null
  const asNumber = Number(value)
  if (asNumber < 0) return null
  return Number(asNumber.toFixed(2))
}

async function ensureCategoryExists(name: string) {
  const { error } = await supabase.from('product_categories').upsert({ name }, { onConflict: 'name' })
  if (isMissingTableError(error)) return
  if (error) throw error
}

async function findCategoryNames(): Promise<string[]> {
  const result = new Set<string>()

  const { data: categoryRows, error: categoryError } = await supabase
    .from('product_categories')
    .select('name')
    .order('name', { ascending: true })

  if (!isMissingTableError(categoryError) && categoryError) {
    throw categoryError
  }

  for (const row of categoryRows ?? []) {
    if (row?.name) {
      result.add(String(row.name))
    }
  }

  const { data: productRows, error: productError } = await supabase.from('products').select('category')
  if (productError) {
    throw productError
  }

  for (const row of productRows ?? []) {
    const category = normalizeName(row?.category)
    if (category) {
      result.add(category)
    }
  }

  return Array.from(result).sort((a, b) => a.localeCompare(b))
}

// GET /api/products
router.get('/', async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, category, img, badge')
    .order('id', { ascending: true })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  return res.json((data ?? []) as ProductRow[])
})

// GET /api/products/categories
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categoryNames = await findCategoryNames()

    const { data: productRows, error: productError } = await supabase.from('products').select('category')
    if (productError) {
      return res.status(500).json({ error: productError.message })
    }

    const counts = new Map<string, number>()
    for (const row of productRows ?? []) {
      const category = normalizeName(row?.category)
      if (!category) continue
      counts.set(category, (counts.get(category) ?? 0) + 1)
    }

    const categories = categoryNames.map((name) => ({
      name,
      productCount: counts.get(name) ?? 0,
    }))

    return res.json(categories)
  } catch (categoryError) {
    const message = categoryError instanceof Error ? categoryError.message : 'Failed to load categories'
    return res.status(500).json({ error: message })
  }
})

// GET /api/products/:id
router.get('/:id', async (req: Request, res: Response) => {
  const id = Number.parseInt(String(req.params.id), 10)

  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid product id' })
  }

  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, category, img, badge')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  if (!data) {
    return res.status(404).json({ error: 'Product not found' })
  }

  return res.json(data as ProductRow)
})

// POST /api/products (admin)
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  const body = req.body as ProductPayload

  const name = normalizeName(body.name)
  const price = normalizePrice(body.price)
  const category = normalizeName(body.category)
  const img = normalizeName(body.img)
  const badge = normalizeBadge(body.badge)

  if (!name || price === null || !category || !img) {
    return res.status(400).json({ error: 'Invalid payload. Required fields: name, price, category, img' })
  }

  try {
    await ensureCategoryExists(category)
  } catch (categoryError) {
    const message = categoryError instanceof Error ? categoryError.message : 'Failed to ensure category'
    return res.status(500).json({ error: message })
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      name,
      price,
      category,
      img,
      badge,
    })
    .select('id, name, price, category, img, badge')
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  return res.status(201).json(data as ProductRow)
})

// PUT /api/products/:id (admin)
router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  const id = Number.parseInt(String(req.params.id), 10)
  const body = req.body as ProductPayload

  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid product id' })
  }

  const patch: ProductPayload = {}

  if (body.name !== undefined) {
    const name = normalizeName(body.name)
    if (!name) {
      return res.status(400).json({ error: 'Invalid name' })
    }
    patch.name = name
  }

  if (body.price !== undefined) {
    const price = normalizePrice(body.price)
    if (price === null) {
      return res.status(400).json({ error: 'Invalid price' })
    }
    patch.price = price
  }

  if (body.category !== undefined) {
    const category = normalizeName(body.category)
    if (!category) {
      return res.status(400).json({ error: 'Invalid category' })
    }
    patch.category = category
  }

  if (body.img !== undefined) {
    const img = normalizeName(body.img)
    if (!img) {
      return res.status(400).json({ error: 'Invalid img' })
    }
    patch.img = img
  }

  if (body.badge !== undefined) {
    const badge = normalizeBadge(body.badge)
    if (body.badge !== null && body.badge !== '' && badge === null) {
      return res.status(400).json({ error: 'Invalid badge' })
    }
    patch.badge = badge
  }

  if (Object.keys(patch).length === 0) {
    return res.status(400).json({ error: 'No valid fields provided to update' })
  }

  if (patch.category) {
    try {
      await ensureCategoryExists(patch.category)
    } catch (categoryError) {
      const message = categoryError instanceof Error ? categoryError.message : 'Failed to ensure category'
      return res.status(500).json({ error: message })
    }
  }

  const { data, error } = await supabase
    .from('products')
    .update(patch)
    .eq('id', id)
    .select('id, name, price, category, img, badge')
    .maybeSingle()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  if (!data) {
    return res.status(404).json({ error: 'Product not found' })
  }

  return res.json(data as ProductRow)
})

// DELETE /api/products/:id (admin)
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  const id = Number.parseInt(String(req.params.id), 10)

  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid product id' })
  }

  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  return res.status(204).send()
})

// POST /api/products/categories (admin)
router.post('/categories', requireAdmin, async (req: Request, res: Response) => {
  const name = normalizeName(req.body?.name)
  if (!name) {
    return res.status(400).json({ error: 'Category name is required' })
  }

  try {
    const existingCategories = await findCategoryNames()
    if (existingCategories.includes(name)) {
      return res.status(409).json({ error: 'Category already exists' })
    }

    await ensureCategoryExists(name)
    return res.status(201).json({ name })
  } catch (categoryError) {
    const message = categoryError instanceof Error ? categoryError.message : 'Failed to create category'
    return res.status(500).json({ error: message })
  }
})

// PUT /api/products/categories/:name (admin)
router.put('/categories/:name', requireAdmin, async (req: Request, res: Response) => {
  const oldName = normalizeName(decodeURIComponent(String(req.params.name)))
  const newName = normalizeName(req.body?.name)

  if (!oldName || !newName) {
    return res.status(400).json({ error: 'Both current and new category names are required' })
  }

  if (oldName === newName) {
    return res.status(400).json({ error: 'New category name must be different' })
  }

  try {
    const existingCategories = await findCategoryNames()

    if (!existingCategories.includes(oldName)) {
      return res.status(404).json({ error: 'Category not found' })
    }

    if (existingCategories.includes(newName)) {
      return res.status(409).json({ error: 'Category already exists' })
    }

    await ensureCategoryExists(newName)

    const { error: productsError } = await supabase
      .from('products')
      .update({ category: newName })
      .eq('category', oldName)

    if (productsError) {
      return res.status(500).json({ error: productsError.message })
    }

    const { error: deleteCategoryError } = await supabase
      .from('product_categories')
      .delete()
      .eq('name', oldName)

    if (!isMissingTableError(deleteCategoryError) && deleteCategoryError) {
      return res.status(500).json({ error: deleteCategoryError.message })
    }

    return res.json({ name: newName })
  } catch (categoryError) {
    const message = categoryError instanceof Error ? categoryError.message : 'Failed to rename category'
    return res.status(500).json({ error: message })
  }
})

// DELETE /api/products/categories/:name (admin)
router.delete('/categories/:name', requireAdmin, async (req: Request, res: Response) => {
  const name = normalizeName(decodeURIComponent(String(req.params.name)))
  const replacementCategory = normalizeName(req.body?.replacementCategory)

  if (!name) {
    return res.status(400).json({ error: 'Category name is required' })
  }

  try {
    const existingCategories = await findCategoryNames()

    if (!existingCategories.includes(name)) {
      return res.status(404).json({ error: 'Category not found' })
    }

    const { data: productsInCategory, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('category', name)

    if (productError) {
      return res.status(500).json({ error: productError.message })
    }

    const hasProducts = (productsInCategory ?? []).length > 0

    if (hasProducts && !replacementCategory) {
      return res.status(400).json({
        error: 'Category has products. Provide replacementCategory to move products before deleting.',
      })
    }

    if (hasProducts && replacementCategory) {
      if (replacementCategory === name) {
        return res.status(400).json({ error: 'replacementCategory must be different from category being deleted' })
      }

      await ensureCategoryExists(replacementCategory)

      const { error: updateProductsError } = await supabase
        .from('products')
        .update({ category: replacementCategory })
        .eq('category', name)

      if (updateProductsError) {
        return res.status(500).json({ error: updateProductsError.message })
      }
    }

    const { error: deleteCategoryError } = await supabase
      .from('product_categories')
      .delete()
      .eq('name', name)

    if (!isMissingTableError(deleteCategoryError) && deleteCategoryError) {
      return res.status(500).json({ error: deleteCategoryError.message })
    }

    return res.status(204).send()
  } catch (categoryError) {
    const message = categoryError instanceof Error ? categoryError.message : 'Failed to delete category'
    return res.status(500).json({ error: message })
  }
})

export default router
