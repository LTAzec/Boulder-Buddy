'use server'

import { revalidatePath } from 'next/cache'
import { Role } from '@/generated/prisma/client'
import { requireRole } from '@/lib/requireRole'
import { serializeError } from '@/lib/serializeError'
import { logger } from '@/lib/logger'

import { GymCreateSchema, GymUpdateSchema, GymDeleteSchema } from '@/schemas/gym.schema'
import { createGym, updateGym, deleteGym } from '@/dal/gym.repo'

export type GymActionResult =
  | { ok: true }
  | { ok: false; error: string | unknown }

export async function gymCreateAction(input: unknown): Promise<GymActionResult> {
  try {
    await requireRole([Role.SuperAdmin])

    const parsed = GymCreateSchema.safeParse(input)
    if (!parsed.success) return { ok: false, error: parsed.error.flatten() }

    await createGym({
      name: parsed.data.name,
      city: parsed.data.city ?? null,
    })

    revalidatePath('/admin/gyms')
    return { ok: true }
  } catch (err) {
    logger.error({ err }, 'Gym create failed')
    return { ok: false, error: serializeError(err) }
  }
}

export async function gymUpdateAction(input: unknown): Promise<GymActionResult> {
  try {
    await requireRole([Role.SuperAdmin])

    const parsed = GymUpdateSchema.safeParse(input)
    if (!parsed.success) return { ok: false, error: parsed.error.flatten() }

    const { id, ...data } = parsed.data
    await updateGym(id, {
      name: data.name,
      city: data.city ?? null,
    })

    revalidatePath('/admin/gyms')
    return { ok: true }
  } catch (err) {
    logger.error({ err }, 'Gym update failed')
    return { ok: false, error: serializeError(err) }
  }
}

export async function gymDeleteAction(input: unknown): Promise<GymActionResult> {
  try {
    await requireRole([Role.SuperAdmin])

    const parsed = GymDeleteSchema.safeParse(input)
    if (!parsed.success) return { ok: false, error: parsed.error.flatten() }

    await deleteGym(parsed.data.id)

    revalidatePath('/admin/gyms')
    return { ok: true }
  } catch (err) {
    logger.error({ err }, 'Gym delete failed')
    return { ok: false, error: serializeError(err) }
  }
}

export type GymDto = {
  id: string
  name: string
  city?: string | null
  createdAt: Date
  updatedAt: Date
  _count?: { walls: number }
}
