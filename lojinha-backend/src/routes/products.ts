import { Router, Request, Response } from 'express'

const router = Router()

// GET /api/products
router.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Listagem de produtos' })
})

// GET /api/products/:id
router.get('/:id', (req: Request, res: Response) => {
  res.json({ message: `Produto ${req.params.id}` })
})

export default router
