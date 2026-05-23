import { FormEvent, useEffect, useState } from 'react'
import {
  listCategories,
  createCategory,
  renameCategory,
  removeCategory,
  type CategorySummary,
} from '../../services/admin'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategorySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      setCategories(await listCategories())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    setSaving(true)
    setError(null)
    try {
      await createCategory(name)
      setNewName('')
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar categoria')
    } finally {
      setSaving(false)
    }
  }

  async function handleRename(current: string) {
    const next = window.prompt(`Novo nome para "${current}":`, current)
    if (!next || next.trim() === current) return
    setError(null)
    try {
      await renameCategory(current, next.trim())
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao renomear categoria')
    }
  }

  async function handleDelete(category: CategorySummary) {
    let replacement: string | undefined

    if (category.productCount > 0) {
      const input = window.prompt(
        `"${category.name}" tem ${category.productCount} produto(s). Informe a categoria destino para mover os produtos:`,
        ''
      )
      if (!input?.trim()) {
        setError('Informe uma categoria destino para poder excluir.')
        return
      }
      replacement = input.trim()
    }

    if (!window.confirm(`Excluir a categoria "${category.name}"?`)) return

    setError(null)
    try {
      await removeCategory(category.name, replacement)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir categoria')
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-extrabold text-gray-800">Categorias</h1>
      <p className="text-sm text-gray-500 mt-0.5 mb-6">Gerencie as categorias dos produtos.</p>

      {error && (
        <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Add form */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-6">
        <h2 className="text-sm font-bold text-gray-700 mb-3">Nova categoria</h2>
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome da categoria"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
          <button
            type="submit"
            disabled={saving}
            className="bg-gray-800 text-white font-semibold px-4 py-2 rounded-xl hover:bg-gray-900 disabled:opacity-60 text-sm transition-colors shrink-0"
          >
            {saving ? 'Salvando...' : 'Adicionar'}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-gray-500">Carregando categorias...</p>
        ) : categories.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">Nenhuma categoria cadastrada.</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <li
                key={cat.name}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{cat.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{cat.productCount} produto(s)</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      void handleRename(cat.name)
                    }}
                    className="text-xs font-semibold border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Renomear
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void handleDelete(cat)
                    }}
                    className="text-xs font-semibold border border-rose-200 text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
