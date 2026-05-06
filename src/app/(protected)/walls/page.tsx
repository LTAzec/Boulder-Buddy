import { listWallsForView } from '@/dal/wall.repo'
import WallsViewClient from './walls-view-client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { canSeeAdminUI } from '@/lib/requireRole'

export default async function WallsPage() {
  const walls = await listWallsForView()
  const showAdminButton = await canSeeAdminUI('Setter')

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold">Walls</h1>

        {showAdminButton && (
          <Button asChild>
            <Link href="/admin/walls">Beheer walls</Link>
          </Button>
        )}
      </div>

      <WallsViewClient walls={walls} />
    </div>
  )
}
