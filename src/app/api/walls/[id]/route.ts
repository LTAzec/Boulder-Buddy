import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prismaClient } from '@/dal/prismaClient'
import { publicApiRoute } from '@/lib/apiRoute'
import { badRequest, ok } from '@/lib/routeResponses'
import { WallDeleteSchema, WallUpdateSchema } from '@/schemas/wall.schema'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} satisfies HeadersInit

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders })
}

type Params = { id: string}
const emptySchema = z.object({})

export const GET = publicApiRoute<Params, typeof emptySchema>({
  routeFn: async ({ logger }, params) => {
    const wall = await prismaClient.wall.findUnique({
      where: { id: params.id },
      include: {
        gym: true,
        sectors: true,
      },
    })

    if (!wall) return badRequest({ message: 'Wall not found' }, corsHeaders)

    logger.info(`Returned wall ${params.id}`)
    return ok(wall, corsHeaders)
  },
})

export const PATCH = publicApiRoute<Params, typeof WallUpdateSchema>({
  schema: WallUpdateSchema,
  type: 'body',
  routeFn: async ({ data, logger }, params) => {
    if (data.id !== params.id) {
      return badRequest({ message: 'ID mismatch' }, corsHeaders)
    }

    const { id, ...updateData } = data as any

    const updated = await prismaClient.wall.update({
      where: { id: params.id },
      data: updateData,
      include: {
        gym: true,
        sectors: true,
      },
    })

    logger.info(`Updated wall ${params.id}`)
    return ok(updated, corsHeaders)
  },
})

export const PUT = PATCH

export const DELETE = publicApiRoute<Params, typeof WallDeleteSchema>({
  schema: WallDeleteSchema,
  type: 'body',
  routeFn: async ({ data, logger }, params) => {
    if (data.id !== params.id) {
      return badRequest({ message: 'ID mismatch' }, corsHeaders)
    }

    await prismaClient.wall.delete({ where: { id: params.id } })

    logger.info(`Deleted wall ${params.id}`)
    return ok({ success: true }, corsHeaders)
  },
})