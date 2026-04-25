import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="flex items-center justify-between gap-12 px-16 py-24 bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 text-white overflow-hidden relative">
      {/* Content */}
      <div className="flex-1 max-w-xl z-10">
        <span className="inline-block bg-white/20 border border-white/40 text-white text-xs font-semibold rounded-full px-4 py-1.5 mb-5">
          🆕 Nova coleção disponível
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4">
          Sua loja favorita,{' '}
          <span className="text-amber-300">agora online</span>
        </h1>
        <p className="text-lg text-white/85 leading-relaxed mb-8">
          Descubra produtos incríveis com os melhores preços. Entrega rápida para todo o Brasil.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/products"
            className="bg-amber-400 hover:bg-amber-300 text-emerald-900 font-bold px-7 py-3 rounded-xl transition-all shadow-lg"
          >
            Explorar produtos
          </Link>
          <Link
            to="/login"
            className="border-2 border-white/60 hover:bg-white/15 text-white font-semibold px-7 py-3 rounded-xl transition-all"
          >
            Criar conta grátis →
          </Link>
        </div>
      </div>

      {/* Visual */}
      <div className="hidden md:flex flex-1 items-center justify-center relative z-10">
        <div className="absolute w-80 h-80 bg-white/10 rounded-[60%_40%_70%_30%/50%_60%_40%_50%]" />
        <div className="relative flex items-center justify-center w-72 h-72 bg-white/10 rounded-3xl shadow-2xl backdrop-blur-sm border border-white/20">
          <span className="text-[9rem] drop-shadow-lg select-none">🛍️</span>
        </div>
      </div>
    </section>
  )
}
