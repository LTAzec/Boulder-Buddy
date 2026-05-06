import 'server-only'
import { prismaClient } from '@/dal/prismaClient'
import type { Prisma } from '@/generated/prisma/client'


export async function listGymsForSelect() {
  return prismaClient.gym.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}

//voor admin CDUD 
export async function listGyms() {
  return prismaClient.gym.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      city: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { walls: true },
      },
    },
  })
}

export async function createGym(data: Prisma.GymCreateInput) {
  return prismaClient.gym.create({ data })
}

export async function updateGym(id: string, data: Prisma.GymUpdateInput) {
  return prismaClient.gym.update({
    where: { id },
    data,
  })
}

export async function deleteGym(id: string) {
  return prismaClient.gym.delete({
    where: { id },
  })
}