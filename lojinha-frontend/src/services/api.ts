import { supabase } from './supabase'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

async function parseErrorMessage(response: Response, fallback: string) {
  try {
    const errorBody = (await response.json()) as { error?: string }
    if (errorBody.error) return errorBody.error
  } catch {
    // no-op
  }

  return fallback
}

export async function apiRequest<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })

  if (!response.ok) {
    const message = await parseErrorMessage(response, 'Erro ao processar requisicao')
    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export async function authedApiRequest<T>(path: string, init: RequestInit): Promise<T> {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw new Error(error.message)
  }

  const accessToken = data.session?.access_token
  if (!accessToken) {
    throw new Error('Sessao expirada. Faca login novamente.')
  }

  return apiRequest<T>(path, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      authorization: `Bearer ${accessToken}`,
    },
  })
}
