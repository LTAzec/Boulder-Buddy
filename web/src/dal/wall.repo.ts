import { prismaClient } from '@/dal/prismaClient'
import type { WallCreateInput, WallUpdateInput } from '@/schemas/wall.schema'

export async function listWallsForSelect() {
  return prismaClient.wall.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}

// --- Admin list (met gym + sector count) ---
export async function listWalls() {
  return prismaClient.wall.findMany({
    orderBy: [{ name: 'asc' }],
    include: {
      gym: { select: { id: true, name: true } },
      _count: { select: { sectors: true } },
    },
  })
}

export async function listWallsForView() {
  return prismaClient.wall.findMany({
    orderBy: [{ name: 'asc' }],
    select: {
      id: true,
      name: true,
      imageUrl: true,
      gym: { select: { id: true, name: true } },
      _count: { select: { sectors: true } },
    },
  })
}

export type WallForView = Awaited<ReturnType<typeof listWallsForView>>[number]


export async function getWallById(id: string) {
  return prismaClient.wall.findUnique({
    where: { id },
    include: {
      gym: { select: { id: true, name: true } },
      _count: { select: { sectors: true } },
    },
  })
}

export async function createWall(data: WallCreateInput) {
  return prismaClient.wall.create({
    data: {
      name: data.name,
      gymId: data.gymId,
      imageUrl: data.imageUrl ?? null,
    },
  })
}

export async function updateWall(data: WallUpdateInput) {
  const { id, ...rest } = data
  return prismaClient.wall.update({
    where: { id },
    data: {
      ...(rest.name !== undefined ? { name: rest.name } : {}),
      ...(rest.gymId !== undefined ? { gymId: rest.gymId } : {}),
      ...(rest.imageUrl !== undefined ? { imageUrl: rest.imageUrl } : {}),
    },
  })
}

export async function deleteWall(id: string) {
  return prismaClient.wall.delete({
    where: { id },
  })
}