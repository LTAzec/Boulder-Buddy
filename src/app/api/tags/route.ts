import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prismaClient } from '@/dal/prismaClient'
import { publicApiRoute } from '@/lib/apiRoute'
import { created, ok, badRequest } from '@/lib/routeResponses'
import { TagCreateSchema } from '@/schemas/tag.schema'
import { Prisma } from '@/generated/prisma/client'


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
    const tags = await prismaClient.tag.findMany({
      orderBy: { name: 'asc' },
    })
    logger.info(`Returned ${tags.length} tags`)
    return ok(tags, corsHeaders)
  },
})

export const POST = publicApiRoute<unknown, typeof TagCreateSchema>({
  schema: TagCreateSchema,
  type: 'body',
  routeFn: async ({ data, logger }) => {
    try {
      const tag = await prismaClient.tag.create({ data })
      logger.info(`Created tag ${tag.id}`)
      return created(tag, corsHeaders)
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        return badRequest({ message: 'Tag naam bestaat al' }, corsHeaders)
      }
      throw e
    }
  },
})

