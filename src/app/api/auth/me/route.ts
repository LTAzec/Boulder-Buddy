import { publicApiRoute } from '@/lib/apiRoute'
import { ok, unauthorized } from '@/lib/routeResponses'
import { z } from 'zod'
import { validateJwtToken } from '@/lib/jwtUtils'
import { headers } from 'next/headers'

const emptySchema = z.object({})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} satisfies HeadersInit

export const OPTIONS = () => new Response(null, { status: 204, headers: corsHeaders })

export const GET = publicApiRoute<unknown, typeof emptySchema>({
  routeFn: async () => {
    const h = await headers()
    const authHeader = h.get('authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return unauthorized({ message: 'Missing token' }, corsHeaders)
    }

    const token = authHeader.slice('Bearer '.length).trim()
    const payload = validateJwtToken(token)

    if (!payload) {
      return unauthorized({ message: 'Invalid token' }, corsHeaders)
    }

    return ok({ user: payload }, corsHeaders)
  },
})
