import { notFound } from 'next/navigation'
import { getBoulderForViewById } from '@/dal/boulder.repo'
import BoulderDetailClient from './boulder-detail-client'
import { canSeeAdminUI } from '@/lib/requireRole'

// tijdelijk (tot je comments echt uit DB komen)
const mockComments = [
  {
    id: '1',
    userId: 'user1',
    username: 'climber_alex',
    body: 'Great problem! The crux move to the third hold is really tricky.',
    createdAt: '2025-01-20T10:30:00Z',
    avatar: null,
  },
]

export default async function BoulderDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  const resolved = await Promise.resolve(params)
  const id = resolved?.id
  if (!id) return notFound()

  const boulder = await getBoulderForViewById(id)
  if (!boulder) return notFound()

  const showAdminButton = await canSeeAdminUI('Setter')

  return (
    <div className="min-h-screen bg-background">
      <BoulderDetailClient
        boulder={boulder}
        mockComments={mockComments}
        showAdminButton={showAdminButton}
      />
    </div>
  )
}
