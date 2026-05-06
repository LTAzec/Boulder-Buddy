import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prismaClient } from '@/dal/prismaClient'
import { publicApiRoute } from '@/lib/apiRoute'
import { badRequest, ok, unauthorized } from '@/lib/routeResponses'
import { hashPassword } from '@/lib/passwordUtils'
import { createJwtToken } from '@/lib/jwtUtils'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} satisfies HeadersInit

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

const RegisterSchema = z.object({
  email: z.string().email(),
  username: z.string().min(2),
  password: z.string().min(8),
})

export const POST = publicApiRoute<unknown, typeof RegisterSchema>({
  schema: RegisterSchema,
  type: 'body',
  routeFn: async ({ data, logger }) => {
    const existing = await prismaClient.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return badRequest({ message: 'Email already in use' }, corsHeaders)
    }

    const user = await prismaClient.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hashPassword(data.password),
      },
      select: { id: true, email: true, username: true, role: true },
    })

    const token = createJwtToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    })

    logger.info(`User registered: ${user.id}`)
    return ok({ token }, corsHeaders)
  },
})
