'use server'

import {revalidatePath} from 'next/cache'
import { prismaClient } from '@/dal/prismaClient'
import {protectedFormAction, protectedServerFunction} from '@/lib/serverFunctions'

import {AdminUserDeleteSchema, AdminUserUpdateSchema} from '@/schemas/adminUser.schema'

function assertAdmin(profile: {id: string; role: string}) {
  if (profile.role !== 'Admin') {
    // Door te throwen laat je wrapper dit afhandelen (globalErrorMessage / logging)
    throw new Error('Forbidden: admin only')
  }
}

/**
 * USERS LIST voor Admin scherm
 * - Kan gebruikt worden in een server page (via call) of client (server function call)
 */
export const adminListUsersServerFunction = protectedServerFunction({
  serverFn: async ({profile}) => {
    assertAdmin(profile)

    const users = await prismaClient.user.findMany({
      orderBy: {email: 'asc'},
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        _count: {
          select: {
            sessions: true,
            logs: true,
            likes: true,
            comments: true,
            bouldersSet: true,
          },
        },
      },
    })

    return {success: true, users}
  },
  functionName: 'Admin list users server function',
})

/**
 * USER UPDATEN (username + role)
 * - FormAction zodat je dit makkelijk vanuit dialog/form kan submitten
 */
export const adminUpdateUserAction = protectedFormAction({
  schema: AdminUserUpdateSchema,
  serverFn: async ({data, profile}) => {
    assertAdmin(profile)

    // Jezelf niet per ongeluk locken door Admin weg te nemen
    if (data.id === profile.id && data.role !== 'Admin') {
      return {
        success: false,
        errors: {errors: ['Je kan je eigen Admin-rol niet verwijderen.']},
      }
    }

    await prismaClient.user.update({
      where: {id: data.id},
      data: {
        username: data.username,
        role: data.role,
      },
    })

    revalidatePath('/admin/users')
    return {success: true}
  },
  functionName: 'Admin update user action',
  globalErrorMessage: 'We konden de gebruiker niet aanpassen. Probeer opnieuw.',
})

/**
 * USER DELETEN (veilig)
 * - Eerst setByUserId null zetten, anders faalt delete door de Boulder->User relatie.
 * - Logs/Likes/Comments/Sessions cascaden wel (door onDelete: Cascade in je schema).
 */
export const adminDeleteUserAction = protectedFormAction({
  schema: AdminUserDeleteSchema,
  serverFn: async ({data, profile}) => {
    assertAdmin(profile)

    if (data.id === profile.id) {
      return {
        success: false,
        errors: {errors: ['Je kan je eigen account niet verwijderen.']},
      }
    }

    // Loskoppelen van "bouldersSet" (geen onDelete op die relatie)
    await prismaClient.boulder.updateMany({
      where: {setByUserId: data.id},
      data: {setByUserId: null},
    })

    await prismaClient.user.delete({where: {id: data.id}})

    revalidatePath('/admin/users')
    return {success: true}
  },
  functionName: 'Admin delete user action',
  globalErrorMessage: 'We konden de gebruiker niet verwijderen. Probeer opnieuw.',
})
