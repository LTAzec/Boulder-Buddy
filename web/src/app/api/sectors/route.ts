import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prismaClient } from '@/dal/prismaClient'
import { publicApiRoute } from '@/lib/apiRoute'
import { created, ok } from '@/lib/routeResponses'
import { SectorCreateSchema } from '@/schemas/sector.schema'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} satisfies HeadersInit

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders })
}

// /api/sectors?wallId=...
const SectorQuerySchema = z.object({
  wallId: z.string().uuid().optional(),
})

export const GET = publicApiRoute<unknown, typeof SectorQuerySchema>({
  schema: SectorQuerySchema,
  type: 'searchParams',
  routeFn: async ({ data, logger }) => {
    const sectors = await prismaClient.sector.findMany({
      where: data.wallId ? { wallId: data.wallId } : undefined,
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: {
        wall: true,
      },
    })

    logger.info(`Returned ${sectors.length} sectors`)
    return ok(sectors, corsHeaders)
  },
})

export const POST = publicApiRoute<unknown, typeof SectorCreateSchema>({
  schema: SectorCreateSchema,
  type: 'body',
  routeFn: async ({ data, logger }) => {
    const sector = await prismaClient.sector.create({
      data,
      include: { wall: true },
    })

    logger.info(`Created sector ${sector.id}`)
    return created(sector, corsHeaders)
  },
})