import { apiFetch } from './apiClient'

export type Wall = {
  id: string
  name: string
  gymId: string
}

export async function listWalls(gymId?: string): Promise<Wall[]> {
  const qs = gymId ? `?gymId=${encodeURIComponent(gymId)}` : ''
  return apiFetch<Wall[]>(`/api/walls${qs}`)
}

export async function createWall(input: { name: string; gymId: string }): Promise<Wall> {
  return apiFetch<Wall>('/api/walls', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateWall(input: { id: string; name: string; gymId: string }): Promise<Wall> {
  return apiFetch<Wall>(`/api/walls/${input.id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function deleteWall(id: string): Promise<{ success: true }> {
  return apiFetch<{ success: true }>(`/api/walls/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  })
}
