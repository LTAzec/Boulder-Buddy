import { prismaClient } from '@/dal/prismaClient'
import { publicApiRoute } from '@/lib/apiRoute'
import { created, ok } from '@/lib/routeResponses'
import { BoulderCreateSchema } from '@/schemas/boulder.schema'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} satisfies HeadersInit

export const OPTIONS = publicApiRoute({
  routeFn: async () => ok({ ok: true }, corsHeaders),
})

// GET /api/boulders  met filter optioneel: wallId, sectorId, isActive
export const GET = publicApiRoute({
  routeFn: async ({ logger, request }) => {
    const { searchParams } = new URL(request.url)

    const wallId = searchParams.get('wallId') || undefined
    const sectorId = searchParams.get('sectorId') || undefined
    const isActiveParam = searchParams.get('isActive')

    const isActive =
      isActiveParam === null
        ? undefined
        : isActiveParam === 'true'
          ? true
          : isActiveParam === 'false'
            ? false
            : undefined

    const boulders = await prismaClient.boulder.findMany({
      where: {
        ...(sectorId ? { sectorId } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(wallId
          ? {
              sector: {
                wallId,
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sector: true,
        setBy: { select: { id: true, username: true } },
        tags: { include: { tag: true } },
        _count: { select: { likes: true, comments: true, logs: true } },
      },
    })

    logger.info(
      { count: boulders.length, wallId, sectorId, isActive },
      'Returned boulders',
    )
    return ok(boulders, corsHeaders)
  },
  // publicApiRoute, authenticated: false by default
})

export const POST = publicApiRoute({
  schema: BoulderCreateSchema,
  type: 'body',
  routeFn: async ({ data, logger }) => {
    const createdBoulder = await prismaClient.boulder.create({
      data,
      include: {
        sector: true,
        setBy: { select: { id: true, username: true } },
        tags: { include: { tag: true } },
        _count: { select: { likes: true, comments: true, logs: true } },
      },
    })

    logger.info({ id: createdBoulder.id }, 'Created boulder')
    return created(createdBoulder, corsHeaders)
  },
})
