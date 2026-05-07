import { listWalls } from '@/dal/wall.repo'
import { listGymsForSelect } from '@/dal/gym.repo'
import WallsCrudClient from './wall-crud-client'

export default async function WallsPage() {
  const [walls, gyms] = await Promise.all([
    listWalls(),
    listGymsForSelect(),
  ])

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Walls</h1>
      <WallsCrudClient initialWalls={walls} gyms={gyms} />
    </div>
  )
}
