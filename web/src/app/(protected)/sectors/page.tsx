import { listSectorsForView } from '@/dal/sector.repo'
import SectorsViewClient from './sectors-view-client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { canSeeAdminUI } from '@/lib/requireRole'

export default async function SectorsPage() {
  const sectors = await listSectorsForView()
  const showAdminButton = await canSeeAdminUI('Setter')

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold">Sectors</h1>

        {showAdminButton && (
          <Button asChild>
            <Link href="/admin/sectors">Beheer sectors</Link>
          </Button>
        )}
      </div>

      <SectorsViewClient sectors={sectors} />
    </div>
  )
}
