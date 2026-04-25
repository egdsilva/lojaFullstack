import { Router, Request, Response } from 'express'

const router = Router()

// POST /api/auth/login
router.post('/login', (_req: Request, res: Response) => {
  res.json({ message: 'Login' })
})

// POST /api/auth/register
router.post('/register', (_req: Request, res: Response) => {
  res.json({ message: 'Registro' })
})

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  res.json({ message: 'Logout' })
})

export default router
