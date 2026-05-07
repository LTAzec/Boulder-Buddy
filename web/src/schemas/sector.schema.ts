import { z } from 'zod'

export const SectorCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60),
  wallId: z.string().uuid('Wall is required'),
  order: z.coerce.number().int().min(0).max(999).default(0),
  imageUrl: z.string().optional().nullable().or(z.literal('')).refine((v) => { //geen verplicht veld, laat null toe
  if (!v) return true //leeg is ok
  if (v.startsWith('/uploads/')) return true //interne path is ok
  try {
    const u = new URL(v) //externe url
    return u.protocol === 'http:' || u.protocol === 'https:' //alleen http(s) toelaten
  } catch {
    return false
  }
}, { message: 'Invalid URL' }),

})

export const SectorUpdateSchema = SectorCreateSchema.extend({
  id: z.string().uuid(),
})

export const SectorDeleteSchema = z.object({
  id: z.string().uuid(),
})

export type SectorCreateInput = z.infer<typeof SectorCreateSchema>
export type SectorUpdateInput = z.infer<typeof SectorUpdateSchema>
