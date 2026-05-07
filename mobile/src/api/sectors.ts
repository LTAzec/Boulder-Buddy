import { apiFetch } from './apiClient'

export type Sector = {
  id: string
  name: string
  wallId: string
  order: number
  imageUrl: string | null
}

export type Wall = {
  id: string
  name: string
}

// Belangrijk: DateTime velden komen in JSON als string (ISO) binnen.
export type Boulder = {
  id: string
  name: string | null
  color: string
  grade: string

  sectorId: string

  setByUserId: string | null
  isActive: boolean

  imageUrl: string | null
  videoUrl: string | null

  posX: number | null
  posY: number | null

  setDate: string | null

  createdAt: string
  updatedAt: string
}

// List view
// GET /api/sectors
export async function listSectors(): Promise<Sector[]> {
  return apiFetch<Sector[]>('/api/sectors')
}

// filtered op wallId
export async function listSectorsByWall(wallId: string): Promise<Sector[]> {
  const qs = new URLSearchParams({ wallId }).toString()
  return apiFetch<Sector[]>(`/api/sectors?${qs}`)
}

// Detail view
// GET /api/sectors/:id  (include: wall + boulders)
export type SectorDetail = Sector & {
  wall: Wall
  boulders: Boulder[]
}

export async function getSectorById(id: string): Promise<SectorDetail> {
  return apiFetch<SectorDetail>(`/api/sectors/${id}`)
}

// CRUD
export async function createSector(input: {
  name: string
  wallId: string
  order: number
  imageUrl?: string | null
}): Promise<Sector> {
  return apiFetch<Sector>('/api/sectors', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      wallId: input.wallId,
      order: input.order,
      imageUrl: input.imageUrl ?? null,
    }),
  })
}

export async function updateSector(input: {
  id: string
  name: string
  wallId: string
  order: number
  imageUrl?: string | null
}): Promise<Sector> {
  return apiFetch<Sector>(`/api/sectors/${input.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      id: input.id,
      name: input.name,
      wallId: input.wallId,
      order: input.order,
      imageUrl: input.imageUrl ?? null,
    }),
  })
}

export async function deleteSector(id: string): Promise<{ success: true }> {
  return apiFetch<{ success: true }>(`/api/sectors/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  })
}
