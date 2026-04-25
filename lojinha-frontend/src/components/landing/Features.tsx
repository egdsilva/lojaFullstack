const features = [
  { icon: '🚚', title: 'Entrega Rápida', desc: 'Receba seus pedidos em casa com agilidade e segurança.' },
  { icon: '💳', title: 'Pagamento Fácil', desc: 'Pix, cartão de crédito ou débito — você escolhe.' },
  { icon: '🔒', title: 'Compra Segura', desc: 'Seus dados protegidos do início ao fim da compra.' },
  { icon: '⭐', title: 'Qualidade Garantida', desc: 'Produtos selecionados com avaliações verificadas.' },
]

export default function Features() {
  return (
    <section id="features" className="py-20 px-6 text-center bg-white">
      <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight mb-3">
        Por que comprar na Lojinha?
      </h2>
      <p className="text-gray-400 text-base max-w-md mx-auto mb-12">
        Pensamos em cada detalhe para você ter a melhor experiência.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-gray-50 rounded-2xl p-7 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all text-left"
          >
            <div className="text-4xl mb-4">{f.icon}</div>
            <h3 className="text-base font-bold text-gray-800 mb-2">{f.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
