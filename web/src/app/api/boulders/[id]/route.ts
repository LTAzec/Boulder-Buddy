import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prismaClient } from '@/dal/prismaClient'
import { publicApiRoute } from '@/lib/apiRoute'
import { badRequest, ok } from '@/lib/routeResponses'
import { BoulderUpdateSchema } from '@/schemas/boulder.schema'

const emptySchema = z.object({})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} satisfies HeadersInit

type Params = { id: string }
type BoulderUpdateInput = z.infer<typeof BoulderUpdateSchema>

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

// GET /api/boulders/[id]
export const GET = publicApiRoute<Params, typeof emptySchema>({
  routeFn: async ({ logger }, params) => {
    const boulder = await prismaClient.boulder.findUnique({
      where: { id: params.id },
      include: {
        sector: { include: { wall: true } },
        setBy: { select: { id: true, username: true, email: true } },
        tags: { include: { tag: { select: { id: true, name: true } } } },
        _count: { select: { likes: true, comments: true, logs: true } },
      },
    })

    if (!boulder) return badRequest({ message: 'Boulder not found' }, corsHeaders)

    logger.info(`Returned boulder ${params.id}`)
    return ok(boulder, corsHeaders)
  },
})

// PATCH /api/boulders/[id]
export const PATCH = publicApiRoute<Params, typeof BoulderUpdateSchema>({
  schema: BoulderUpdateSchema,
  type: 'body',
  routeFn: async ({ data, logger }, params) => {
    
    const body = data as BoulderUpdateInput

    // id uit body negeren: we vertrouwen URL param
    const { id: _ignoreId, tagIds, ...scalarFields } = body

    const updated = await prismaClient.boulder.update({
      where: { id: params.id },
      data: {
        ...scalarFields,

        // tagIds:
        // - undefined -> niets aanpassen
        // - [] -> alle tags weg
        // - [..] -> vervangen door nieuwe set
        ...(tagIds !== undefined
          ? {
              tags: {
                deleteMany: {}, // reset join table
                create: tagIds.map((tagId) => ({ tagId })),
              },
            }
          : {}),
      },
      include: {
        sector: { include: { wall: true } },
        setBy: { select: { id: true, username: true, email: true } },
        tags: { include: { tag: { select: { id: true, name: true } } } },
        _count: { select: { likes: true, comments: true, logs: true } },
      },
    })

    logger.info(`Updated boulder ${params.id}`)
    return ok(updated, corsHeaders)
  },
})

// DELETE /api/boulders/[id]
export const DELETE = publicApiRoute<Params, typeof emptySchema>({
  routeFn: async ({ logger }, params) => {
    await prismaClient.boulder.delete({ where: { id: params.id } })
    logger.info(`Deleted boulder ${params.id}`)
    return ok({ ok: true }, corsHeaders)
  },
})

