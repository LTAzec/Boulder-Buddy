'use server'

import { revalidatePath } from 'next/cache'
import { Role } from '@/generated/prisma/client'
import { requireRole } from '@/lib/requireRole'
import { serializeError } from '@/lib/serializeError'
import { logger } from '@/lib/logger'
import { SectorCreateSchema, SectorUpdateSchema, SectorDeleteSchema,} from '@/schemas/sector.schema'
import { createSector, updateSector, deleteSector } from '@/dal/sector.repo'

export type SectorActionResult = 
  | { ok: true }
  | { ok: false; error: string | unknown }

export async function sectorCreateAction(input: unknown): Promise<SectorActionResult> {
  try {
    await requireRole([Role.Setter, Role.Admin])

    const parsed = SectorCreateSchema.safeParse(input)
    if (!parsed.success) {
      return { ok: false, error: parsed.error.flatten() }
    }

    await createSector(parsed.data)
    revalidatePath('/admin/sectors')
    return { ok: true }
  } catch (err) {
    logger.error({ err }, 'Sector create failed')
    return { ok: false, error: serializeError(err) }
  }
}

export async function sectorUpdateAction(input: unknown): Promise<SectorActionResult> {
  try {
    await requireRole([Role.Setter, Role.Admin])

    const parsed = SectorUpdateSchema.safeParse(input)
    if (!parsed.success) {
      return { ok: false, error: parsed.error.flatten() }
    }

    const { id, ...data } = parsed.data
    await updateSector(id, data)
    revalidatePath('/admin/sectors')
    return { ok: true }
  } catch (err) {
    logger.error({ err }, 'Sector update failed')
    return { ok: false, error: serializeError(err) }
  }
}

export async function sectorDeleteAction(input: unknown): Promise<SectorActionResult> {
  try {
    await requireRole([Role.Admin])

    const parsed = SectorDeleteSchema.safeParse(input)
    if (!parsed.success) {
      return { ok: false, error: parsed.error.flatten() }
    }

    await deleteSector(parsed.data.id)
    revalidatePath('/admin/sectors')
    return { ok: true }
  } catch (err) {
    logger.error({ err }, 'Sector delete failed')
    return { ok: false, error: serializeError(err) }
  }
}

export type SectorDto = {
    id: string
    name: string
    wallId: string
    order: number
    imageUrl?: string | null
    createdAt: Date
    updatedAt: Date
    wall?:{ id: string; name: string}
}

