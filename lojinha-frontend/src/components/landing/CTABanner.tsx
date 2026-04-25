import { Link } from 'react-router-dom'

export default function CTABanner() {
  return (
    <section className="flex flex-wrap items-center justify-between gap-6 px-16 py-16 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
      <div>
        <h2 className="text-2xl font-extrabold mb-1">Pronto para começar?</h2>
        <p className="text-white/85 text-sm">
          Crie sua conta de graça e aproveite todas as vantagens da Lojinha.
        </p>
      </div>
      <Link
        to="/login"
        className="bg-white text-amber-700 font-bold px-8 py-3 rounded-xl hover:bg-amber-50 transition-all shadow"
      >
        Cadastre-se agora
      </Link>
    </section>
  )
}
