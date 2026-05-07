import { listBoulders } from '@/dal/boulder.repo'
import { listSectors } from '@/dal/sector.repo'
import { prismaClient } from '@/dal/prismaClient'
import { BouldersCrudClient } from './boulder-crud-client'

export default async function BouldersPage() {
  const [boulders, sectors, tags] = await Promise.all([
    listBoulders(),
    listSectors(),
    
    prismaClient.tag.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }).catch(() => []),
  ])

  // sector options voor dropdown
  const sectorOptions = sectors.map((s) => ({
    id: s.id,
    name: `${s.wall?.name ?? 'Wall'} • ${s.name}`,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Boulders</h1>
        <p className="text-sm text-muted-foreground">Create, edit and manage boulders.</p>
      </div>

      <BouldersCrudClient
        boulders={boulders as any}
        sectors={sectorOptions}
        tags={tags}
      />
    </div>
  )
}
