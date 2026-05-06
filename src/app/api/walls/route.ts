import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prismaClient } from '@/dal/prismaClient'
import { publicApiRoute } from '@/lib/apiRoute'
import { created, ok } from '@/lib/routeResponses'
import { WallCreateSchema } from '@/schemas/wall.schema'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} satisfies HeadersInit

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders })
}

// optional filter by gymId
const WallQuerySchema = z.object({
    gymId: z.string().uuid().optional(),
})

export const GET = publicApiRoute<unknown, typeof WallQuerySchema>({
  schema: WallQuerySchema,
  type: 'searchParams',
  routeFn: async ({ data, logger }) => {
    const walls = await prismaClient.wall.findMany({
      where: data.gymId ? { gymId: data.gymId } : undefined,
      orderBy: { name: 'asc' },
      include: {
        gym: true,
        sectors: true,
      },
    })

    logger.info(`Returned ${walls.length} walls`)
    return ok(walls, corsHeaders)
  },
})

export const POST = publicApiRoute<unknown, typeof WallCreateSchema>({
  schema: WallCreateSchema,
  type: 'body',
  routeFn: async ({ data, logger }) => {
    const wall = await prismaClient.wall.create({
      data,
      include: {
        gym: true,
        sectors: true,
      },
    })

    logger.info(`Created wall ${wall.id}`)
    return created(wall, corsHeaders)
  },
})