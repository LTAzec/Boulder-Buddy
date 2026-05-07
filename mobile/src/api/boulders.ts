import { apiFetch } from './apiClient'

export type UserMini = {
  id: string
  email: string
  username: string
  role?: string
}

export type WallMini = {
  id: string
  name: string
  imageUrl: string | null
}

export type SectorMini = {
  id: string
  name: string
  wallId: string
  imageUrl: string | null
  wall?: WallMini | null
}

export type TagMini = {
  id: string
  name: string
}

export type BoulderTagJoin = {
  tag: TagMini
}

export type BoulderDetail = {
  id: string
  name: string | null
  grade: string | null
  color: string | null
  isActive: boolean
  setDate: string | null

  imageUrl: string | null
  videoUrl: string | null

  sector?: {
    id: string
    name: string
    wall?: { id: string; name: string }
    wallId?: string
  } | null

  setBy?: {
    id: string
    email?: string
    username?: string
    role?: string
  } | null

  tags?: Array<{ tag?: { id: string; name: string } | null }> | null

  //_count NIET optional
  _count: {
    likes: number
    comments: number
    logs: number
  }
}

// GET boulder by id
export async function getBoulderById(id: string): Promise<BoulderDetail> {
  return apiFetch<BoulderDetail>(`/api/boulders/${id}`)
}

// GET /api/boulders
export async function listBoulders(params?: {
  wallId?: string
  sectorId?: string
  isActive?: boolean
}): Promise<BoulderDetail[]> {
  const sp = new URLSearchParams()

  if (params?.wallId) sp.set('wallId', params.wallId)
  if (params?.sectorId) sp.set('sectorId', params.sectorId)
  if (typeof params?.isActive === 'boolean') sp.set('isActive', String(params.isActive))

  const qs = sp.toString()
  return apiFetch<BoulderDetail[]>(`/api/boulders${qs ? `?${qs}` : ''}`)
}

export type CreateBoulderInput = {
  name?: string | null
  color: string
  grade: string
  sectorId: string

  setByUserId?: string | null
  isActive: boolean

  imageUrl?: string | null
  videoUrl?: string | null

  posX?: number | null
  posY?: number | null

  setDate?: string | null

  tagIds?: string[]
}

export async function createBoulder(input: CreateBoulderInput): Promise<BoulderDetail> {
  return apiFetch<BoulderDetail>('/api/boulders', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export type UpdateBoulderInput = CreateBoulderInput & {
  id: string
}

export async function updateBoulder(input: UpdateBoulderInput): Promise<BoulderDetail> {
  const { id, ...rest } = input

  // Backend schema verwacht id in body
  return apiFetch<BoulderDetail>(`/api/boulders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ id, ...rest }),
  })
}


export async function deleteBoulder(id: string): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>(`/api/boulders/${id}`, {
    method: 'DELETE',
  })
}
