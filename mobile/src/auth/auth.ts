import { apiFetch } from '@/src/api/apiClient'

export type AuthUser = {
  id: string
  email: string
  username: string
  role: string
}

export async function login(email: string, password: string) {
  return apiFetch<{ token: string }>(`/api/auth`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function register(
  email: string,
  username: string,
  password: string,
) {
  return apiFetch<{ token: string }>(`/api/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ email, username, password }),
  })
}

export async function meJwt(token: string) {
  return apiFetch<{ user: AuthUser }>(`/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}
