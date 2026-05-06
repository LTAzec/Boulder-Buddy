'use server'

import { revalidatePath } from 'next/cache'
import { Role } from '@/generated/prisma/client'
import { requireRole } from '@/lib/requireRole'
import { serializeError } from '@/lib/serializeError'
import { logger } from '@/lib/logger'
import { BoulderCreateSchema, BoulderUpdateSchema, BoulderDeleteSchema } from '@/schemas/boulder.schema'
import { createBoulder, updateBoulder, deleteBoulder } from '@/dal/boulder.repo'
import type { BoulderColor, BoulderGrade } from '@/generated/prisma/client'
import { z } from 'zod'

export type BoulderActionResult =
  | { ok: true }
  | { ok: false; error: string | unknown }

  //definieeren van de payload types
type BoulderUpdatePayload = Omit<z.infer<typeof BoulderUpdateSchema>, 'id'>


export async function boulderCreateAction(input: unknown): Promise<BoulderActionResult> {
  try {
    await requireRole([Role.Admin, Role.Setter])

    const parsed = BoulderCreateSchema.safeParse(input)
    if (!parsed.success) {
      return { ok: false, error: parsed.error.flatten() }
    }

    await createBoulder(parsed.data)
    revalidatePath('/admin/boulders')
    return { ok: true }
  } catch (err) {
    logger.error({ err }, 'Boulder create failed')
    return { ok: false, error: serializeError(err) }
  }
}

export async function boulderUpdateAction(input: unknown): Promise<BoulderActionResult> {
  try {
    await requireRole([Role.Admin, Role.Setter])

    const parsed = BoulderUpdateSchema.safeParse(input)
    if (!parsed.success) {
      return { ok: false, error: parsed.error.flatten() }
    }

    const { id, ...data } = parsed.data
    await updateBoulder(id, data as BoulderUpdatePayload)
    revalidatePath('/admin/boulders')
    return { ok: true }
  } catch (err) {
    logger.error({ err }, 'Boulder update failed')
    return { ok: false, error: serializeError(err) }
  }
}


export async function boulderDeleteAction(input: unknown): Promise<BoulderActionResult> {
  try {
    await requireRole([Role.Admin]) 

    const parsed = BoulderDeleteSchema.safeParse(input)
    if (!parsed.success) {
      return { ok: false, error: parsed.error.flatten() }
    }

    await deleteBoulder(parsed.data.id)
    revalidatePath('/admin/boulders')
    return { ok: true }
  } catch (err) {
    logger.error({ err }, 'Boulder delete failed')
    return { ok: false, error: serializeError(err) }
  }
}

export type BoulderDto = {
  id: string
  name?: string | null

  color: BoulderColor
  grade: BoulderGrade

  sectorId: string
  setByUserId?: string | null

  setDate: Date
  isActive: boolean

  imageUrl?: string | null
  videoUrl?: string | null

  posX?: number | null
  posY?: number | null

  createdAt: Date
  updatedAt: Date

  sector?: {
    id: string
    name: string
    wallId: string
    wall?: { id: string; name: string }
  }


  tags?: Array<{ tag: { id: string; name: string } }>

  setBy?: { id: string; email: string; role: Role }
}
