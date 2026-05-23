import { ReactNode, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { getAuthProfile } from '../services/auth'

type AuthRouteProps = {
  mode: 'protected' | 'guest' | 'admin'
  children: ReactNode
}

export default function AuthRoute({ mode, children }: AuthRouteProps) {
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminErrorMessage, setAdminErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function updateAdminState() {
      if (mode !== 'admin') {
        if (isMounted) setIsAdmin(false)
        if (isMounted) setAdminErrorMessage(null)
        return
      }

      try {
        const profile = await getAuthProfile()
        if (!isMounted) return
        setIsAdmin(profile.isAdmin)
        setAdminErrorMessage(null)
      } catch (requestError) {
        if (!isMounted) return
        setIsAdmin(false)
        const message = requestError instanceof Error ? requestError.message : 'Nao foi possivel validar permissao admin.'
        setAdminErrorMessage(message)
      }
    }

    async function loadSession() {
      const { data } = await supabase.auth.getSession()
      if (!isMounted) return
      const authenticated = Boolean(data.session)
      setIsAuthenticated(authenticated)

      if (authenticated) {
        await updateAdminState()
      } else {
        setIsAdmin(false)
      }

      setIsLoading(false)
    }

    void loadSession()

    const { data: authSubscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoading(true)
      const authenticated = Boolean(session)
      setIsAuthenticated(authenticated)

      if (!authenticated) {
        setIsAdmin(false)
        setAdminErrorMessage(null)
        setIsLoading(false)
        return
      }

      void updateAdminState().finally(() => {
        if (!isMounted) return
        setIsLoading(false)
      })
    })

    return () => {
      isMounted = false
      authSubscription.subscription.unsubscribe()
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-sm font-semibold text-gray-500">
        Carregando sessao...
      </div>
    )
  }

  if (mode === 'protected' && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (mode === 'admin' && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (mode === 'admin' && isAuthenticated && !isAdmin) {
    return (
      <Navigate
        to="/account"
        state={{
          adminAccessDenied: true,
          adminAccessError: adminErrorMessage,
        }}
        replace
      />
    )
  }

  if (mode === 'guest' && isAuthenticated) {
    return <Navigate to="/account" replace />
  }

  return <>{children}</>
}
