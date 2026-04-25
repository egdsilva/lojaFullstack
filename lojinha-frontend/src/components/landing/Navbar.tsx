import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 h-16 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <Link to="/" className="text-xl font-extrabold text-emerald-700 tracking-tight">
          🛍️ Lojinha
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm font-medium text-gray-600 hover:text-emerald-700 transition-colors">
            Vantagens
          </a>
          <a href="#products" className="text-sm font-medium text-gray-600 hover:text-emerald-700 transition-colors">
            Produtos
          </a>
          <Link
            to="/products"
            className="text-sm font-semibold border-2 border-emerald-700 text-emerald-700 px-4 py-1.5 rounded-lg hover:bg-emerald-700 hover:text-white transition-all"
          >
            Ver catálogo
          </Link>
          <Link
            to="/login"
            className="text-sm font-semibold bg-emerald-700 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-800 transition-all"
          >
            Entrar
          </Link>
        </div>

        {/* Mobile: Entrar + Hambúrguer */}
        <div className="flex md:hidden items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-semibold bg-emerald-700 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-800 transition-all"
          >
            Entrar
          </Link>
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
        <a href="#features" onClick={() => setOpen(false)} className="block px-6 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 border-b border-gray-50">
          Vantagens
        </a>
        <a href="#products" onClick={() => setOpen(false)} className="block px-6 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 border-b border-gray-50">
          Produtos
        </a>
        <div className="px-6 py-4">
          <Link
            to="/products"
            onClick={() => setOpen(false)}
            className="block text-center text-sm font-semibold border-2 border-emerald-700 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-700 hover:text-white transition-all"
          >
            Ver catálogo
          </Link>
        </div>
      </div>
    </>
  )
}
