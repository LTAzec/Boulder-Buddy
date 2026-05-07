'use server'

import {revalidatePath} from 'next/cache'
import {Role} from '@/generated/prisma/client'
import {requireRole} from '@/lib/requireRole'
import {serializeError} from '@/lib/serializeError'
import {logger} from '@/lib/logger'

import {AdminUserUpdateSchema, AdminUserDeleteSchema} from '@/schemas/adminUser.schema'
import {adminUpdateUser, adminDeleteUser} from '@/dal/users'

export type UserAdminActionResult =
  | {ok: true}
  | {ok: false; error: string | unknown}

export async function userAdminUpdateAction(input: unknown): Promise<UserAdminActionResult> {
  try {
    await requireRole([Role.Admin])

    const parsed = AdminUserUpdateSchema.safeParse(input)
    if (!parsed.success) {
      return {ok: false, error: parsed.error.flatten()}
    }

    const {id, ...data} = parsed.data
    await adminUpdateUser(id, data)

    revalidatePath('/admin/users')
    return {ok: true}
  } catch (err) {
    logger.error({err}, 'User admin update failed')
    return {ok: false, error: serializeError(err)}
  }
}

export async function userAdminDeleteAction(input: unknown): Promise<UserAdminActionResult> {
  try {
    await requireRole([Role.Admin])

    const parsed = AdminUserDeleteSchema.safeParse(input)
    if (!parsed.success) {
      return {ok: false, error: parsed.error.flatten()}
    }

    await adminDeleteUser(parsed.data.id)

    revalidatePath('/admin/users')
    return {ok: true}
  } catch (err) {
    logger.error({err}, 'User admin delete failed')
    return {ok: false, error: serializeError(err)}
  }
}
