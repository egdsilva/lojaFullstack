import { Link } from 'react-router-dom'

const highlights = [
  { name: 'Camiseta Básica', price: 'R$ 49,90', img: 'https://placehold.co/300x300?text=Camiseta' },
  { name: 'Tênis Casual', price: 'R$ 189,90', img: 'https://placehold.co/300x300?text=T%C3%AAnis' },
  { name: 'Mochila Urban', price: 'R$ 129,90', img: 'https://placehold.co/300x300?text=Mochila' },
]

export default function ProductHighlights() {
  return (
    <section id="products" className="py-20 px-6 text-center bg-emerald-50">
      <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight mb-3">
        Destaques da semana
      </h2>
      <p className="text-gray-400 text-base max-w-md mx-auto mb-12">
        Os itens mais amados pelos nossos clientes.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {highlights.map((product) => (
          <div
            key={product.name}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-md transition-all text-left"
          >
            <img src={product.img} alt={product.name} className="w-full aspect-square object-cover" />
            <div className="p-5 flex flex-col gap-3">
              <h4 className="font-bold text-gray-800">{product.name}</h4>
              <span className="text-lg font-extrabold text-amber-600">{product.price}</span>
              <Link
                to="/products"
                className="text-center text-sm font-semibold bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg transition-all"
              >
                Ver produto
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <Link
          to="/products"
          className="inline-block text-sm font-semibold border-2 border-emerald-700 text-emerald-700 px-7 py-3 rounded-xl hover:bg-emerald-700 hover:text-white transition-all"
        >
          Ver todos os produtos
        </Link>
      </div>
    </section>
  )
}
