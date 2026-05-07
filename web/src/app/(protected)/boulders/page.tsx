import { listActiveBouldersForView } from '@/dal/boulder.repo'
import BouldersViewClient from './boulders-view-client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { canSeeAdminUI } from '@/lib/requireRole'

export default async function BouldersPage() {
  const boulders = await listActiveBouldersForView()
  const showAdminButton = await canSeeAdminUI('Setter')

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold">Boulders</h1>

        {showAdminButton && (
          <Button asChild>
            <Link href="/admin/boulders">Beheer boulders</Link>
          </Button>
        )}
      </div>

      <BouldersViewClient boulders={boulders} />
    </div>
  )
}
