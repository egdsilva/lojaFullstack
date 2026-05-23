import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/landing/Navbar'
import Footer from '../components/landing/Footer'
import { supabase } from '../services/supabase'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    async function redirectIfAuthenticated() {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        navigate('/products', { replace: true })
      }
    }

    void redirectIfAuthenticated()
  }, [navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (password !== confirmPassword) {
      setError('As senhas nao conferem.')
      return
    }

    setIsLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    setIsLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    if (!data.session) {
      setSuccessMessage('Conta criada. Verifique seu email para confirmar o cadastro e depois faca login.')
      return
    }

    navigate('/products', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-extrabold text-gray-800">Criar conta</h1>
          <p className="text-sm text-gray-500 mt-2 mb-6">Cadastre-se para salvar carrinho e acompanhar pedidos.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="text-sm font-semibold text-gray-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="voce@exemplo.com"
              />
            </label>

            <label className="text-sm font-semibold text-gray-700">
              Senha
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Minimo de 6 caracteres"
              />
            </label>

            <label className="text-sm font-semibold text-gray-700">
              Confirmar senha
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Repita a senha"
              />
            </label>

            {error && <p className="text-sm text-rose-600 font-medium">{error}</p>}
            {successMessage && <p className="text-sm text-emerald-700 font-medium">{successMessage}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-bold rounded-lg py-3 text-sm transition-colors"
            >
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-6">
            Ja tem conta?{' '}
            <Link to="/login" className="text-emerald-700 font-semibold hover:text-emerald-800">
              Fazer login
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
