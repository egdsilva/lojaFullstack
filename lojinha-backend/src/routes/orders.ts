import { Router, Request, Response } from 'express'

const router = Router()

// GET /api/orders
router.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Listagem de pedidos' })
})

// POST /api/orders
router.post('/', (_req: Request, res: Response) => {
  res.json({ message: 'Pedido criado' })
})

export default router
