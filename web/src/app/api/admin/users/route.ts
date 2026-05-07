import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@/generated/prisma/client'
import { Role } from '@/generated/prisma/enums'
import { prismaClient } from '@/dal/prismaClient'
import { protectedApiRoute } from '@/lib/apiRoute'
import { ok, created, badRequest } from '@/lib/routeResponses'
import { AdminUserCreateSchema } from '@/schemas/adminUser.schema'
import { hashPassword } from '@/lib/passwordUtils'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} satisfies HeadersInit

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

const emptySchema = z.object({})

const userSelect = {
  id: true,
  email: true,
  username: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const

export const GET = protectedApiRoute<unknown, typeof emptySchema>({
  requiredRoles: [Role.Admin],
  routeFn: async ({ logger }) => {
    const users = await prismaClient.user.findMany({
      orderBy: [{ role: 'asc' }, { username: 'asc' }],
      select: userSelect,
    })

    logger.info(`Returned ${users.length} users`)
    return ok(users, corsHeaders)
  },
})

export const POST = protectedApiRoute<unknown, typeof AdminUserCreateSchema>({
  requiredRoles: [Role.Admin],
  schema: AdminUserCreateSchema,
  type: 'body',
  routeFn: async ({ data, logger }) => {
    try {
      const user = await prismaClient.user.create({
        data: {
          email: data.email,
          username: data.username,
          role: data.role,
          password: hashPassword(data.password),
        },
        select: userSelect,
      })

      logger.info(`Created user ${user.id}`)
      return created(user, corsHeaders)
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        return badRequest({ message: 'Email bestaat al' }, corsHeaders)
      }
      throw e
    }
  },
})
