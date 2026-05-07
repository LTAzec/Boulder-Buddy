'use server'

import { revalidatePath } from 'next/cache'
import { Role } from '@/generated/prisma/client'
import { requireRole } from '@/lib/requireRole'
import { logger } from '@/lib/logger'
import { serializeError } from '@/lib/serializeError'
import { WallCreateSchema, WallUpdateSchema, WallDeleteSchema } from '@/schemas/wall.schema'
import { listWalls, createWall, updateWall, deleteWall } from '@/dal/wall.repo'

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: unknown }

// --- Actions ---
export async function listWallsAction(): Promise<ActionResult<unknown>> {
  try {
    await requireRole([Role.Admin, Role.Setter])

    const data = await listWalls()
    return { ok: true, data }
  } catch (err) {
    logger.error({ err: serializeError(err) }, 'listWallsAction failed')
    return { ok: false, error: err }
  }
}

export async function createWallAction(input: unknown): Promise<ActionResult<unknown>> {
  try {
    await requireRole([Role.Admin, Role.Setter])

    const data = WallCreateSchema.parse(input)
    const created = await createWall(data)

    revalidatePath('/admin/walls')
    return { ok: true, data: created }
  } catch (err) {
    logger.error({ err: serializeError(err) }, 'createWallAction failed')
    return { ok: false, error: err }
  }
}

export async function updateWallAction(input: unknown): Promise<ActionResult<unknown>> {
  try {
    await requireRole([Role.Admin, Role.Setter])

    const data = WallUpdateSchema.parse(input)
    const updated = await updateWall(data)

    revalidatePath('/admin/walls')
    return { ok: true, data: updated }
  } catch (err) {
    logger.error({ err: serializeError(err) }, 'updateWallAction failed')
    return { ok: false, error: err }
  }
}

export async function deleteWallAction(input: unknown): Promise<ActionResult<unknown>> {
  try {
    await requireRole([Role.Admin, Role.Setter])

    const { id } = WallDeleteSchema.parse(input)
    const deleted = await deleteWall(id)

    revalidatePath('/admin/walls')
    return { ok: true, data: deleted }
  } catch (err) {
    logger.error({ err: serializeError(err) }, 'deleteWallAction failed')
    return { ok: false, error: err }
  }
}

export type WallDto = {
  id: string
  name: string
  gymId: string
  imageUrl?: string | null
  createdAt: Date
  updatedAt: Date
  gym?: { id: string; name: string }
  _count?: { sectors: number }
}
