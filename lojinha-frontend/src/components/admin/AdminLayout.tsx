import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { supabase } from '../../services/supabase'

type NavItem = {
  to: string
  label: string
  icon: string
  end: boolean
}

const navItems: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/admin/products', label: 'Produtos', icon: '📦', end: false },
  { to: '/admin/categories', label: 'Categorias', icon: '🏷️', end: false },
  { to: '/admin/orders', label: 'Pedidos', icon: '🧾', end: false },
]

function navClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
    isActive
      ? 'bg-emerald-600 text-white'
      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
  }`
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-gray-800">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
          Painel admin
        </p>
        <p className="text-lg font-extrabold text-white mt-0.5">🛍️ Lojinha</p>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={navClass}
          >
            <span className="text-base leading-none w-5 text-center">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800 flex flex-col gap-0.5">
        <NavLink
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <span className="text-base leading-none w-5 text-center">←</span>
          Voltar ao site
        </NavLink>
        <button
          type="button"
          onClick={() => {
            void handleLogout()
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-rose-400 hover:bg-gray-800 hover:text-rose-300 transition-colors text-left"
        >
          <span className="text-base leading-none w-5 text-center">🚪</span>
          Sair
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 bg-gray-900 sticky top-0 h-screen self-start">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 h-12 flex items-center justify-between px-4 shadow-lg">
        <span className="text-sm font-extrabold text-white">🛍️ Admin</span>
        <button
          type="button"
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setMobileOpen((v) => !v)}
          className="text-gray-300 hover:text-white text-lg w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-800 transition-colors"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <aside
            className="absolute top-12 left-0 bottom-0 w-56 bg-gray-900 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Page content */}
      <main className="flex-1 min-w-0 flex flex-col pt-12 md:pt-0">
        <Outlet />
      </main>
    </div>
  )
}
