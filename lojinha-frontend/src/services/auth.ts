import { authedApiRequest } from './api'

export type AuthProfile = {
  user: {
    id: string
    email: string | null
  }
  isAdmin: boolean
}

export async function getAuthProfile(): Promise<AuthProfile> {
  return authedApiRequest<AuthProfile>('/api/auth/me', {
    method: 'GET',
  })
}
