import { Router, Request, Response } from 'express'
import { requireAuth } from '../middlewares/auth.js'

const router = Router()

// GET /api/auth/me
router.get('/me', requireAuth, (req: Request, res: Response) => {
  if (!req.authUser) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  return res.json({
    user: req.authUser,
    isAdmin: Boolean(req.isAdmin),
  })
})

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
