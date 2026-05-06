import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prismaClient } from '@/dal/prismaClient'
import { publicApiRoute } from '@/lib/apiRoute'
import { badRequest, ok, unauthorized } from '@/lib/routeResponses'
import { verifyPassword } from '@/lib/passwordUtils'
import { createJwtToken } from '@/lib/jwtUtils'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} satisfies HeadersInit

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const POST = publicApiRoute<unknown, typeof LoginSchema>({
  schema: LoginSchema,
  type: 'body',
  routeFn: async ({ data, logger }) => {
    const user = await prismaClient.user.findUnique({
      where: { email: data.email },
    })

    if (!user || !verifyPassword(user.password, data.password)) {
      return unauthorized({ message: 'Invalid credentials' }, corsHeaders)
    }

    const token = createJwtToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    })

    logger.info(`User ${user.id} logged in`)
    return ok({ token }, corsHeaders)
  },
})
