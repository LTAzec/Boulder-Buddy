import {Navigation} from '@/components/navigation'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import {ArrowLeft, MapPin} from 'lucide-react'
import Link from 'next/link'

// Mock data - replace with actual database queries
const wallsData: Record<string, any> = {
  '1': {
    id: '1',
    name: 'Main Wall',
    gymName: 'Gustaaf Bouldering Gym',
    imageUrl: '/climbing-wall-with-colorful-holds.jpg',
    description: 'Our largest and most diverse climbing wall, featuring routes from beginner to advanced levels.',
    sectors: [
      {
        id: '1',
        name: 'Sector A',
        order: 1,
        boulders: [
          {id: '1', name: 'Crimpy Corner', color: 'Blue', grade: '6b'},
          {id: '4', name: 'Jug Haul', color: 'Yellow', grade: '4'},
          {id: '7', name: 'Edge Master', color: 'Green', grade: '6a'},
          {id: '10', name: 'Balance Beam', color: 'Purple', grade: '5'},
        ],
      },
      {
        id: '2',
        name: 'Sector B',
        order: 2,
        boulders: [
          {id: '11', name: 'Power Pull', color: 'Red', grade: '6c'},
          {id: '12', name: 'Steep Street', color: 'Orange', grade: '7a'},
          {id: '13', name: 'Easy Does It', color: 'Yellow', grade: '3'},
        ],
      },
      {
        id: '3',
        name: 'Sector C',
        order: 3,
        boulders: [
          {id: '14', name: 'Tech Test', color: 'Blue', grade: '6b'},
          {id: '15', name: 'Pinch Perfect', color: 'Purple', grade: '6c'},
        ],
      },
      {
        id: '4',
        name: 'Sector D',
        order: 4,
        boulders: [
          {id: '16', name: 'Crimp City', color: 'Red', grade: '7b'},
          {id: '17', name: 'Flow State', color: 'Green', grade: '6a'},
        ],
      },
    ],
  },
  '2': {
    id: '2',
    name: 'Overhang Zone',
    gymName: 'Gustaaf Bouldering Gym',
    imageUrl: '/overhanging-climbing-wall.jpg',
    description: 'Test your strength and technique on our challenging overhanging wall sections.',
    sectors: [
      {
        id: '5',
        name: 'Sector A',
        order: 1,
        boulders: [
          {id: '6', name: 'Dynamic Flow', color: 'Orange', grade: '6c'},
          {id: '18', name: 'Roof Master', color: 'Black', grade: '7b'},
        ],
      },
      {
        id: '6',
        name: 'Sector B',
        order: 2,
        boulders: [
          {id: '2', name: 'Overhang Beast', color: 'Red', grade: '7b'},
          {id: '19', name: 'Explosive Move', color: 'Orange', grade: '7a'},
        ],
      },
      {
        id: '7',
        name: 'Sector C',
        order: 3,
        boulders: [{id: '20', name: 'Steep Challenge', color: 'Purple', grade: '6c'}],
      },
    ],
  },
  '3': {
    id: '3',
    name: 'Slab Section',
    gymName: 'Gustaaf Bouldering Gym',
    imageUrl: '/slab-climbing-wall.jpg',
    description: 'Perfect for improving balance and footwork with our technical slab climbing.',
    sectors: [
      {
        id: '8',
        name: 'Sector A',
        order: 1,
        boulders: [
          {id: '3', name: 'Slab Master', color: 'Green', grade: '6a'},
          {id: '21', name: 'Friction Fun', color: 'Yellow', grade: '5'},
        ],
      },
      {
        id: '9',
        name: 'Sector B',
        order: 2,
        boulders: [
          {id: '22', name: 'Footwork Focus', color: 'Blue', grade: '6a'},
          {id: '23', name: 'Balance Test', color: 'Green', grade: '6b'},
        ],
      },
    ],
  },
  '4': {
    id: '4',
    name: 'Cave Area',
    gymName: 'Gustaaf Bouldering Gym',
    imageUrl: '/cave-climbing-wall-with-holds.jpg',
    description: 'Experience unique climbing angles in our cave section with roof and undercling features.',
    sectors: [
      {
        id: '10',
        name: 'Sector A',
        order: 1,
        boulders: [
          {id: '5', name: 'Pinch Paradise', color: 'Purple', grade: '7a'},
          {id: '24', name: 'Undercling Master', color: 'Red', grade: '6c'},
        ],
      },
      {
        id: '11',
        name: 'Sector B',
        order: 2,
        boulders: [
          {id: '25', name: 'Roof Crack', color: 'Black', grade: '7b'},
          {id: '26', name: 'Cave Dweller', color: 'Orange', grade: '6b'},
        ],
      },
    ],
  },
}

const colorClasses: Record<string, string> = {
  Red: 'bg-red-500',
  Blue: 'bg-blue-500',
  Green: 'bg-green-500',
  Yellow: 'bg-yellow-500',
  Orange: 'bg-orange-500',
  Purple: 'bg-purple-500',
  Black: 'bg-gray-900',
  White: 'bg-gray-100',
}

export default async function WallDetailPage({params}: {params: Promise<{id: string}>}) {
  const resolvedParams = await params
  const wall = wallsData[resolvedParams.id]

  if (!wall) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container max-w-4xl mx-auto py-16 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Wall not found</h1>
          <Button asChild>
            <Link href="/walls">Back to Walls</Link>
          </Button>
        </div>
      </div>
    )
  }

  const totalBoulders = wall.sectors.reduce((acc: number, sector: any) => acc + sector.boulders.length, 0)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container max-w-6xl mx-auto py-8 px-4">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/walls">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Walls
          </Link>
        </Button>

        {/* Wall Header */}
        <div className="mb-8">
          <Card className="overflow-hidden">
            <div className="aspect-[21/9] overflow-hidden">
              <img src={wall.imageUrl || '/placeholder.svg'} alt={wall.name} className="w-full h-full object-cover" />
            </div>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-3xl mb-2">{wall.name}</CardTitle>
                  <CardDescription className="text-base mb-4">{wall.description}</CardDescription>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{wall.gymName}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6">
                <div>
                  <div className="text-2xl font-bold text-primary">{wall.sectors.length}</div>
                  <div className="text-sm text-muted-foreground">Sectors</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{totalBoulders}</div>
                  <div className="text-sm text-muted-foreground">Total Boulders</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sectors */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Sectors</h2>

          <div className="grid gap-6">
            {wall.sectors.map((sector: any) => (
              <Card key={sector.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{sector.name}</CardTitle>
                      <CardDescription>{sector.boulders.length} boulders</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sector.boulders.map((boulder: any) => (
                      <Link
                        key={boulder.id}
                        href={`/boulders/${boulder.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors">
                        <div
                          className={`w-8 h-8 rounded-full ${colorClasses[boulder.color]} flex-shrink-0 border-2 border-white shadow-sm`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{boulder.name}</div>
                          <div className="text-sm text-muted-foreground">{boulder.color}</div>
                        </div>
                        <Badge variant="secondary">{boulder.grade}</Badge>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
