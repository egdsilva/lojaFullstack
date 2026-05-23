import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/landing/Navbar'
import Footer from '../components/landing/Footer'
import { supabase } from '../services/supabase'
import { getAuthProfile } from '../services/auth'

type AccountRouteState = {
  adminAccessDenied?: boolean
  adminAccessError?: string | null
}

export default function AccountPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const routeState = location.state as AccountRouteState | null
  const adminAccessDenied = Boolean(routeState?.adminAccessDenied)
  const adminAccessError = routeState?.adminAccessError ?? null

  useEffect(() => {
    async function loadProfile() {
      try {
        const [userResult, profileResult] = await Promise.all([
          supabase.auth.getUser(),
          getAuthProfile().catch(() => ({ user: null, isAdmin: false })),
        ])

        setEmail(userResult.data.user?.email ?? null)
        setIsAdmin(Boolean(profileResult.isAdmin))
      } finally {
        setLoading(false)
      }
    }

    void loadProfile()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">Minha conta</h1>
          <p className="text-sm text-gray-500 mt-2">Gerencie sua sessao e acompanhe seus pedidos.</p>

          {adminAccessDenied && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p className="font-semibold">Nao foi possivel abrir o painel admin.</p>
              <p className="mt-1">
                {adminAccessError ?? 'Seu usuario nao esta com permissao de administrador ou houve erro ao validar a permissao.'}
              </p>
            </div>
          )}

          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Email</p>
            <p className="text-sm font-semibold text-gray-700 mt-1">
              {loading ? 'Carregando...' : email ?? 'Nao disponivel'}
            </p>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            <Link
              to="/my-orders"
              className="inline-flex items-center justify-center rounded-xl border-2 border-emerald-700 text-emerald-700 font-semibold px-4 py-3 hover:bg-emerald-700 hover:text-white transition-colors"
            >
              Acompanhar meus pedidos
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center justify-center rounded-xl border-2 border-amber-400 text-amber-700 font-semibold px-4 py-3 hover:bg-amber-50 transition-colors"
              >
                Ir para painel admin
              </Link>
            )}
            <button
              onClick={() => {
                void handleLogout()
              }}
              className="inline-flex items-center justify-center rounded-xl bg-gray-800 text-white font-semibold px-4 py-3 hover:bg-gray-900 transition-colors"
            >
              Sair da conta
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
