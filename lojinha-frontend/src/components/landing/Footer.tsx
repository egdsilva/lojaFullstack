export default function Footer() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 bg-gray-900 text-gray-400 text-sm">
      <span className="text-white font-bold text-base">🛍️ Lojinha</span>
      <span>© {new Date().getFullYear()} Lojinha. Todos os direitos reservados.</span>
      <div className="flex gap-6">
        <a href="#" className="hover:text-white transition-colors">Termos</a>
        <a href="#" className="hover:text-white transition-colors">Privacidade</a>
        <a href="#" className="hover:text-white transition-colors">Contato</a>
      </div>
    </footer>
  )
}
