import { NextResponse } from 'next/server'
import { prismaClient } from '@/dal/prismaClient'
import { publicApiRoute } from '@/lib/apiRoute'
import { ok } from '@/lib/routeResponses'
import { z } from 'zod'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} satisfies HeadersInit

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

const emptySchema = z.object({})

export const GET = publicApiRoute<unknown, typeof emptySchema>({
  routeFn: async ({ logger }) => {
    const gyms = await prismaClient.gym.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    })

    logger.info(`Returned ${gyms.length} gyms`)
    return ok(gyms, corsHeaders)
  },
})
