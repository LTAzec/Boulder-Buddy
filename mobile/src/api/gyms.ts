import { apiFetch } from './apiClient'

export type Gym = { id: string; name: string }

export async function listGyms(): Promise<Gym[]> {
  return apiFetch<Gym[]>('/api/gyms')
}
