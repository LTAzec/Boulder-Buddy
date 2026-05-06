import { prismaClient } from '@/dal/prismaClient'
import { BoulderColor, BoulderGrade } from '@/generated/prisma/enums'

export async function listBoulders() {
  return prismaClient.boulder.findMany({
    include: {
      sector: {
        select: {
          id: true,
          name: true,
          wallId: true,
          wall: { select: { id: true, name: true } },
        },
      },
      setBy: { select: { id: true, email: true, role: true } },

      // join table → tag details meegeven
      tags: {
        include: {
          tag: { select: { id: true, name: true } },
        },
      },
      _count: { select: { likes: true, comments: true } },
    },
    // deze orderBy zorgt voor een logische volgorde in de UI, gegroepeerd per wall/sector
    orderBy: [
  { sector: { wall: { name: 'asc' } } },
  { sector: { name: 'asc' } },
  { grade: 'asc' },
  { color: 'asc' },
  { createdAt: 'desc' }],

  })
}

export async function listActiveBouldersForView() {
  return prismaClient.boulder.findMany({
    where: { isActive: true },
    include: {
      sector: {
        select: {
          id: true,
          name: true,
          wallId: true,
          wall: { select: { id: true, name: true } },
        },
      },
      tags: {
        include: { tag: { select: { id: true, name: true } } },
      },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: [{ createdAt: 'desc' }],
  })
}

export async function getBoulderForViewById(id: string) {
  return prismaClient.boulder.findUnique({
  where: { id },
  include: {
    sector: {
      include: {
        wall: true,
      },
    },
    _count: {
      select: {
        likes: true,
        comments: true,
        logs: true,
      },
    },
  },
})

}

export type BoulderDetailForView = Awaited<ReturnType<typeof getBoulderForViewById>>


export type BoulderWriteData = {
  name?: string | null
  color: BoulderColor
  grade: BoulderGrade

  sectorId: string

  setByUserId?: string | null
  isActive: boolean

  imageUrl?: string | null
  videoUrl?: string | null

  posX?: number | null
  posY?: number | null

  // optioneel: tags
  tagIds?: string[]
}

export async function createBoulder(data: BoulderWriteData) {
  const { tagIds, ...boulderData } = data

  return prismaClient.boulder.create({
    data: {
      ...boulderData,
      ...(tagIds?.length
        ? {
            tags: {
              create: tagIds.map((tagId) => ({
                tagId,
              })),
            },
          }
        : {}),
    },
  })
}

export async function updateBoulder(id: string, data: BoulderWriteData) {
  const { tagIds, ...boulderData } = data

  return prismaClient.boulder.update({
    where: { id },
    data: {
      ...boulderData,
      ...(tagIds
        ? {
            tags: {
              deleteMany: {}, // reset alle joins
              create: tagIds.map((tagId) => ({ tagId })),
            },
          }
        : {}),
    },
  })
}

export async function deleteBoulder(id: string) {
  return prismaClient.boulder.delete({ where: { id } })
}
