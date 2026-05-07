import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prismaClient } from '@/dal/prismaClient'
import { publicApiRoute } from '@/lib/apiRoute'
import { badRequest, ok } from '@/lib/routeResponses'
import { TagUpdateSchema, TagDeleteSchema } from '@/schemas/tag.schema'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} satisfies HeadersInit

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

type Params = { id: string }
const emptySchema = z.object({})

export const GET = publicApiRoute<Params, typeof emptySchema>({
  routeFn: async ({ logger }, params) => {
    const tag = await prismaClient.tag.findUnique({
      where: { id: params.id },
    })

    if (!tag) {
      return badRequest({ message: 'Tag not found' }, corsHeaders)
    }

    logger.info(`Returned tag ${params.id}`)
    return ok(tag, corsHeaders)
  },
})

export const PATCH = publicApiRoute<Params, typeof TagUpdateSchema>({
  schema: TagUpdateSchema,
  type: 'body',
  routeFn: async ({ data, logger }, params) => {
    if (data.id !== params.id) {
      return badRequest({ message: 'ID mismatch' }, corsHeaders)
    }

    const { id, ...updateData } = data

    const updated = await prismaClient.tag.update({
      where: { id: params.id },
      data: updateData,
    })

    logger.info(`Updated tag ${params.id}`)
    return ok(updated, corsHeaders)
  },
})

export const PUT = PATCH

export const DELETE = publicApiRoute<Params, typeof TagDeleteSchema>({
  schema: TagDeleteSchema,
  type: 'body',
  routeFn: async ({ data, logger }, params) => {
    if (data.id !== params.id) {
      return badRequest({ message: 'ID mismatch' }, corsHeaders)
    }

    await prismaClient.tag.delete({
      where: { id: params.id },
    })

    logger.info(`Deleted tag ${params.id}`)
    return ok({ success: true }, corsHeaders)
  },
})
