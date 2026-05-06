import {listGyms} from '@/dal/gym.repo'
import GymsCrudClient from './gyms-crud-client'

export default async function GymsPage() {
  const gyms = await listGyms()

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Gyms</h1>
      <GymsCrudClient gyms={gyms} />
    </div>
  )
}
