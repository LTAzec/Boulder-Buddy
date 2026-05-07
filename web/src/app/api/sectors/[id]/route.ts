import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prismaClient } from '@/dal/prismaClient'
import { publicApiRoute } from '@/lib/apiRoute'
import { badRequest, ok } from '@/lib/routeResponses'
import { SectorUpdateSchema, SectorDeleteSchema } from '@/schemas/sector.schema'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} satisfies HeadersInit

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders })
}

type Params = {id: string}
const emptySchema = z.object({})

// /api/sectors/:id
export const GET = publicApiRoute<Params, typeof emptySchema>({
  routeFn: async ({ logger }, params) => {
    const sector = await prismaClient.sector.findUnique({
      where: { id: params.id },
      include: {
        wall: true,
        boulders: true,
      },
    })

    if (!sector) {
      return badRequest({ message: 'Sector not found' }, corsHeaders)
    }

    logger.info(`Returned sector ${params.id}`)
    return ok(sector, corsHeaders)
  },
})

// /api/sectors/:id
export const PATCH = publicApiRoute<Params, typeof SectorUpdateSchema>({
  schema: SectorUpdateSchema,
  type: 'body',
  routeFn: async ({ data, logger }, params) => {
    if (data.id !== params.id) {
      return badRequest({ message: 'ID mismatch' }, corsHeaders)
    }

    const { id, ...updateData } = data as any

    const updated = await prismaClient.sector.update({
      where: { id: params.id },
      data: updateData,
      include: { wall: true },
    })

    logger.info(`Updated sector ${params.id}`)
    return ok(updated, corsHeaders)
  },
})

export const PUT = PATCH

//Delete sector by id
export const DELETE = publicApiRoute<Params, typeof SectorDeleteSchema>({
  schema: SectorDeleteSchema,
  type: 'body',
  routeFn: async ({ data, logger }, params) => {
    if (data.id !== params.id) {
      return badRequest({ message: 'ID mismatch' }, corsHeaders)
    }

    await prismaClient.sector.delete({
      where: { id: params.id },
    })

    logger.info(`Deleted sector ${params.id}`)
    return ok({ success: true }, corsHeaders)
  },
})