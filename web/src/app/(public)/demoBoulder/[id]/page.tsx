import {Navigation} from '@/components/navigation'
import {BoulderDetailClient} from '@/components/boulder-detail-client'

// Mock data - replace with actual database queries
const mockBoulderData: Record<string, any> = {
  '1': {
    id: '1',
    name: 'Crimpy Corner',
    color: 'Blue',
    grade: '6b',
    sector: 'Main Wall - Sector A',
    wall: 'Main Wall',
    imageUrl: '/blue-boulder-problem.jpg',
    videoUrl: null,
    tags: ['Technical', 'Crimps'],
    setBy: 'John Setter',
    setDate: '2025-01-15',
    isActive: true,
    likes: 12,
    isLiked: false,
    posX: 120,
    posY: 80,
  },
  '2': {
    id: '2',
    name: 'Overhang Beast',
    color: 'Red',
    grade: '7b',
    sector: 'Overhang Zone - Sector B',
    wall: 'Overhang Zone',
    imageUrl: '/red-boulder-problem.jpg',
    videoUrl: null,
    tags: ['Power', 'Dynamic'],
    setBy: 'Sarah Routesetter',
    setDate: '2025-01-10',
    isActive: true,
    likes: 24,
    isLiked: false,
    posX: 200,
    posY: 150,
  },
}

const mockComments = [
  {
    id: '1',
    userId: 'user1',
    username: 'climber_alex',
    body: 'Great problem! The crux move to the third hold is really tricky.',
    createdAt: '2025-01-20T10:30:00Z',
    avatar: null,
  },
  {
    id: '2',
    userId: 'user2',
    username: 'boulder_master',
    body: 'Finally sent this one today! Took me 5 attempts but so satisfying.',
    createdAt: '2025-01-21T14:15:00Z',
    avatar: null,
  },
  {
    id: '3',
    userId: 'user3',
    username: 'rock_climber',
    body: 'Any tips for the heel hook section? I keep slipping off.',
    createdAt: '2025-01-22T09:45:00Z',
    avatar: null,
  },
]

export default async function BoulderDetailPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params
  const boulder = mockBoulderData[id]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <BoulderDetailClient boulder={boulder} mockComments={mockComments} />
    </div>
  )
}
