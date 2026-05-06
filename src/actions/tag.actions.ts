'use server'

import { revalidatePath } from "next/cache"
import { TagCreateSchema, TagDeleteSchema, TagUpdateSchema } from "@/schemas/tag.schema"
import { requireRole } from "@/lib/requireRole"
import { serializeError } from "@/lib/serializeError"
import { prismaClient } from "@/dal/prismaClient"
import { Role } from "@/generated/prisma/client"


type ActionOk<T> = { ok: true; data: T }
type ActionFail = { ok: false; error: string; detail?: unknown }
type ActionResult<T> = ActionOk<T> | ActionFail

export type TagDto = {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
}



function normalizeName(name: string) {
    return name.trim().toLowerCase()
}

function prismaErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null) return undefined
  const code = (error as Record<string, unknown>)['code']
  return typeof code === 'string' ? code : undefined
}


export async function listTags(): Promise<TagDto[]> {
    await requireRole([Role.Admin])

    
    return prismaClient.tag.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, createdAt: true, updatedAt: true },
    })
}

export async function createTag(input: unknown): Promise<ActionResult<TagDto>> {
    try {
        await requireRole([Role.Admin])

        const parsed = TagCreateSchema.parse(input)
        const tagName = normalizeName(parsed.name)

        const created = await prismaClient.tag.create({
            data: {name: tagName},
            select: { id: true, name: true, createdAt: true, updatedAt: true },
        })

        revalidatePath('/admin/tags')
        return { ok: true, data: created }
    } catch (error: unknown) {
        const code = prismaErrorCode(error)
        const message = code === 'P2002' ? 'Deze tag bestaat al' : 'Tag aanmaken mislukt.'
        return { ok: false, error: message, detail: serializeError(error) }
    }
}

export async function updateTag(input: unknown): Promise<ActionResult<TagDto>> {
    try {
        await requireRole([Role.Admin])

        const parsed = TagUpdateSchema.parse(input)
        const tagName = normalizeName(parsed.name)

        const updated = await prismaClient.tag.update({
            where: { id: parsed.id },
            data: { name: tagName },
            select: { id: true, name: true, createdAt: true, updatedAt: true },
        })
        revalidatePath('/admin/tags')
        return { ok: true, data: updated }

    } catch (error: unknown) {
        const code = prismaErrorCode(error)
        const message = code === 'P2002' ? 'Deze Tag bestaat al' : code === 'P2025' ? 'Tag niet gevonden' : 'Tag aanpassen mislukt.'

        return { ok: false, error: message, detail: serializeError(error) }
    }
}

export async function deleteTag(input: unknown): Promise<ActionResult<null>> {
    try {
        await requireRole([Role.Admin])
        const parsed = TagDeleteSchema.parse(input)

        await prismaClient.tag.delete({
            where: { id: parsed.id },
        })

        revalidatePath('/admin/tags')
        return { ok: true, data: null }
    } catch (error: unknown) {
        const code = prismaErrorCode(error)
        const message = code === 'P2025' ? 'tag niet gevonden' : 'Tag verwijderen mislukt.'
        return { ok: false, error: message, detail: serializeError(error) }
    }
}