import { prismaClient } from '@/dal/prismaClient'

export async function listSectors() {
  return prismaClient.sector.findMany({
    include: {
      wall: { select: { id: true, name: true } },
    },
    orderBy: [{ wall: { name: 'asc' } }, { order: 'asc' }, { name: 'asc' }],
  })
}

//view-read (zelfde data, klaar voor cards + filters)
export async function listSectorsForView() {
  return prismaClient.sector.findMany({
    include: {
      wall: { select: { id: true, name: true } },
      _count: { select: { boulders: true } }, // handig in cards
    },
    orderBy: [{ wall: { name: 'asc' } }, { order: 'asc' }, { name: 'asc' }],
  })
}

export type SectorForView = Awaited<ReturnType<typeof listSectorsForView>>[number]

//create/update/delete blijven hetzelfde
type SectorWriteData = {
  name: string
  wallId: string
  order: number
  imageUrl?: string | null
}

export async function createSector(data: SectorWriteData) {
  return prismaClient.sector.create({ data })
}

export async function updateSector(id: string, data: SectorWriteData) {
  return prismaClient.sector.update({ where: { id }, data })
}

export async function deleteSector(id: string) {
  return prismaClient.sector.delete({ where: { id } })
}
