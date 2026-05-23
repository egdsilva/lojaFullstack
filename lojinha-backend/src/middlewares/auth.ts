import { NextFunction, Request, Response } from 'express'
import { supabase } from '../config/supabase.js'

type AuthUser = {
  id: string
  email: string | null
}

declare module 'express-serve-static-core' {
  interface Request {
    authUser?: AuthUser
    isAdmin?: boolean
  }
}

function getBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader) return null

  const [type, token] = authorizationHeader.split(' ')
  if (type?.toLowerCase() !== 'bearer' || !token) {
    return null
  }

  return token
}

function isMissingTableError(error: { code?: string } | null) {
  return error?.code === '42P01'
}

async function resolveAdminStatus(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle()

  if (isMissingTableError(error)) {
    return false
  }

  if (error) {
    throw error
  }

  return Boolean(data)
}

async function authenticate(req: Request, res: Response): Promise<boolean> {
  const accessToken = getBearerToken(req.header('authorization'))

  if (!accessToken) {
    res.status(401).json({ error: 'Missing or invalid authorization header' })
    return false
  }

  let data: Awaited<ReturnType<typeof supabase.auth.getUser>>['data']
  let error: Awaited<ReturnType<typeof supabase.auth.getUser>>['error']

  try {
    const result = await supabase.auth.getUser(accessToken)
    data = result.data
    error = result.error
  } catch (authError) {
    const cause = authError as { cause?: { code?: string } }
    if (cause?.cause?.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY') {
      res.status(503).json({
        error: 'Backend cannot reach Supabase due to SSL certificate trust issue',
      })
      return false
    }

    const message = authError instanceof Error ? authError.message : 'Authentication service unavailable'
    res.status(503).json({ error: message })
    return false
  }

  if (error || !data.user) {
    res.status(401).json({ error: 'Invalid or expired token' })
    return false
  }

  const authUser: AuthUser = {
    id: data.user.id,
    email: data.user.email ?? null,
  }

  req.authUser = authUser

  try {
    req.isAdmin = await resolveAdminStatus(authUser.id)
  } catch (adminError) {
    const message = adminError instanceof Error ? adminError.message : 'Failed to resolve admin role'
    res.status(500).json({ error: message })
    return false
  }

  return true
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const isAuthenticated = await authenticate(req, res)
  if (!isAuthenticated) return

  next()
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const isAuthenticated = await authenticate(req, res)
  if (!isAuthenticated) return

  if (!req.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' })
  }

  next()
}