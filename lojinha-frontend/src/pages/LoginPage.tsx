import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/landing/Navbar'
import Footer from '../components/landing/Footer'
import { supabase } from '../services/supabase'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    setIsLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setIsLoading(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    navigate('/products', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-extrabold text-gray-800">Entrar na conta</h1>
          <p className="text-sm text-gray-500 mt-2 mb-6">Use seu email e senha para continuar.</p>

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
                placeholder="********"
              />
            </label>

            {error && <p className="text-sm text-rose-600 font-medium">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-bold rounded-lg py-3 text-sm transition-colors"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-6">
            Nao tem conta?{' '}
            <Link to="/register" className="text-emerald-700 font-semibold hover:text-emerald-800">
              Criar conta
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
