import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@/generated/prisma/client'
import { Role } from '@/generated/prisma/enums'
import { prismaClient } from '@/dal/prismaClient'
import { protectedApiRoute } from '@/lib/apiRoute'
import { ok, badRequest } from '@/lib/routeResponses'
import { AdminUserUpdateSchema, AdminUserDeleteSchema } from '@/schemas/adminUser.schema'
import { hashPassword } from '@/lib/passwordUtils'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} satisfies HeadersInit

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

type Params = { id: string }
const emptySchema = z.object({})

const userSelect = {
  id: true,
  email: true,
  username: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const

export const GET = protectedApiRoute<Params, typeof emptySchema>({
  requiredRoles: [Role.Admin],
  routeFn: async ({ logger }, params) => {
    const user = await prismaClient.user.findUnique({
      where: { id: params.id },
      select: userSelect,
    })

    if (!user) return badRequest({ message: 'User not found' }, corsHeaders)

    logger.info(`Returned user ${params.id}`)
    return ok(user, corsHeaders)
  },
})

export const PATCH = protectedApiRoute<Params, typeof AdminUserUpdateSchema>({
  requiredRoles: [Role.Admin],
  schema: AdminUserUpdateSchema,
  type: 'body',
  routeFn: async ({ data, logger }, params) => {
    if (data.id !== params.id) return badRequest({ message: 'ID mismatch' }, corsHeaders)

    try {
      const { id, password, ...rest } = data
      const updateData: any = { ...rest }
      if (password) updateData.password = hashPassword(password)

      const updated = await prismaClient.user.update({
        where: { id: params.id },
        data: updateData,
        select: userSelect,
      })

      logger.info(`Updated user ${params.id}`)
      return ok(updated, corsHeaders)
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        return badRequest({ message: 'Email bestaat al' }, corsHeaders)
      }
      throw e
    }
  },
})

export const PUT = PATCH

export const DELETE = protectedApiRoute<Params, typeof AdminUserDeleteSchema>({
  requiredRoles: [Role.Admin],
  schema: AdminUserDeleteSchema,
  type: 'body',
  routeFn: async ({ data, logger }, params) => {
    if (data.id !== params.id) return badRequest({ message: 'ID mismatch' }, corsHeaders)

    await prismaClient.user.delete({ where: { id: params.id } })
    logger.info(`Deleted user ${params.id}`)
    return ok({ success: true }, corsHeaders)
  },
})
