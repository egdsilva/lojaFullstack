import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import CartDrawer from '../cart/CartDrawer'
import { supabase } from '../../services/supabase'
import { getAuthProfile } from '../../services/auth'

type AuthUser = {
  email?: string
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const { count, openCart } = useCart()

  useEffect(() => {
    let isMounted = true

    async function resolveAdminState(isAuthenticated: boolean) {
      if (!isAuthenticated) {
        if (isMounted) setIsAdmin(false)
        return
      }

      try {
        const profile = await getAuthProfile()
        if (!isMounted) return
        setIsAdmin(profile.isAdmin)
      } catch {
        if (!isMounted) return
        setIsAdmin(false)
      }
    }

    async function loadSession() {
      const { data } = await supabase.auth.getSession()
      const sessionUser = data.session?.user ?? null
      setUser(sessionUser)
      await resolveAdminState(Boolean(sessionUser))
    }

    void loadSession()

    const { data: authSubscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null
      setUser(sessionUser)
      void resolveAdminState(Boolean(sessionUser))
    })

    return () => {
      isMounted = false
      authSubscription.subscription.unsubscribe()
    }
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setOpen(false)
  }

  return (
    <>
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 h-16 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <Link to="/" className="text-xl font-extrabold text-emerald-700 tracking-tight">
          🛍️ Lojinha
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/#features" className="text-sm font-medium text-gray-600 hover:text-emerald-700 transition-colors">
            Vantagens
          </Link>
          <Link
            to="/products"
            className="text-sm font-semibold border-2 border-emerald-700 text-emerald-700 px-4 py-1.5 rounded-lg hover:bg-emerald-700 hover:text-white transition-all"
          >
            Produtos
          </Link>
          {user ? (
            <>
              <Link
                to="/account"
                className="text-sm font-semibold border-2 border-gray-300 text-gray-700 px-4 py-1.5 rounded-lg hover:border-gray-500 hover:text-gray-900 transition-all"
              >
                Minha conta
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-sm font-semibold border-2 border-amber-400 text-amber-700 px-4 py-1.5 rounded-lg hover:bg-amber-50 transition-all"
                >
                  Painel admin
                </Link>
              )}
              <button
                onClick={() => {
                  void handleLogout()
                }}
                className="text-sm font-semibold bg-gray-800 text-white px-4 py-1.5 rounded-lg hover:bg-gray-900 transition-all"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="text-sm font-semibold border-2 border-emerald-700 text-emerald-700 px-4 py-1.5 rounded-lg hover:bg-emerald-700 hover:text-white transition-all"
              >
                Criar conta
              </Link>
              <Link
                to="/login"
                className="text-sm font-semibold bg-emerald-700 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-800 transition-all"
              >
                Entrar
              </Link>
            </>
          )}
          {/* Cart button desktop */}
          <button
            onClick={openCart}
            aria-label="Abrir carrinho"
            className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            <span className="text-xl">🛒</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-emerald-900 text-[10px] font-extrabold w-5 h-5 flex items-center justify-center rounded-full">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>
        </div>

        {/* Mobile: Entrar + Hambúrguer */}
        <div className="flex md:hidden items-center gap-3">
          {/* Cart button mobile */}
          <button
            onClick={openCart}
            aria-label="Abrir carrinho"
            className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            <span className="text-lg">🛒</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-emerald-900 text-[10px] font-extrabold w-4 h-4 flex items-center justify-center rounded-full">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>
          {user ? (
            <>
              <Link
                to="/account"
                className="text-sm font-semibold border-2 border-gray-300 text-gray-700 px-4 py-1.5 rounded-lg hover:border-gray-500 hover:text-gray-900 transition-all"
              >
                Conta
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-sm font-semibold border-2 border-amber-400 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-all"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={() => {
                  void handleLogout()
                }}
                className="text-sm font-semibold bg-gray-800 text-white px-4 py-1.5 rounded-lg hover:bg-gray-900 transition-all"
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm font-semibold bg-emerald-700 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-800 transition-all"
            >
              Entrar
            </Link>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className={`block w-5 h-0.5 bg-gray-700 rounded transition-transform origin-center ${open ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-700 rounded transition-all ${open ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-700 rounded transition-transform origin-center ${open ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`md:hidden bg-white border-b border-gray-100 overflow-hidden transition-all duration-300 ${open ? 'max-h-56' : 'max-h-0'}`}>
        <Link to="/#features" onClick={() => setOpen(false)} className="block px-6 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 border-b border-gray-50">
          Vantagens
        </Link>
        <div className="px-6 py-4">
          <Link
            to="/products"
            onClick={() => setOpen(false)}
            className="block text-center text-sm font-semibold border-2 border-emerald-700 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-700 hover:text-white transition-all"
          >
            Produtos
          </Link>
        </div>
        {!user && (
          <div className="px-6 pb-4">
            <Link
              to="/register"
              onClick={() => setOpen(false)}
              className="block text-center text-sm font-semibold border-2 border-emerald-700 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-700 hover:text-white transition-all"
            >
              Criar conta
            </Link>
          </div>
        )}
        {user && (
          <div className="px-6 pb-4 grid gap-3">
            <Link
              to="/account"
              onClick={() => setOpen(false)}
              className="block text-center text-sm font-semibold border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-gray-500 hover:text-gray-900 transition-all"
            >
              Minha conta
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="block text-center text-sm font-semibold border-2 border-amber-400 text-amber-700 px-4 py-2 rounded-lg hover:bg-amber-50 transition-all"
              >
                Painel admin
              </Link>
            )}
          </div>
        )}
        {user?.email && (
          <p className="px-6 pb-4 text-xs text-gray-500 truncate">{user.email}</p>
        )}
      </div>

      <CartDrawer />
    </>
  )
}
