import {Navigation} from '@/components/navigation'
import {Card, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import {ArrowRight} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Mock data - replace with actual database queries
const walls = [
  {
    id: '1',
    name: 'Main Wall',
    imageUrl: '/images/achterkantMuur.jpg',
    description: 'Our largest and most diverse climbing wall, featuring routes from beginner to advanced levels.',
    sectors: [
      {id: '1', name: 'Sector A', order: 1, boulderCount: 12},
      {id: '2', name: 'Sector B', order: 2, boulderCount: 15},
      {id: '3', name: 'Sector C', order: 3, boulderCount: 10},
      {id: '4', name: 'Sector D', order: 4, boulderCount: 8},
    ],
  },
  {
    id: '2',
    name: 'Overhang Zone',
    imageUrl: '/images/muurNaastOverhang.jpg',
    description: 'Test your strength and technique on our challenging overhanging wall sections.',
    sectors: [
      {id: '5', name: 'Sector A', order: 1, boulderCount: 11},
      {id: '6', name: 'Sector B', order: 2, boulderCount: 13},
      {id: '7', name: 'Sector C', order: 3, boulderCount: 8},
    ],
  },
  {
    id: '3',
    name: 'Slab Section',
    imageUrl: '/images/muurTegenInkom.jpg',
    description: 'Perfect for improving balance and footwork with our technical slab climbing.',
    sectors: [
      {id: '8', name: 'Sector A', order: 1, boulderCount: 14},
      {id: '9', name: 'Sector B', order: 2, boulderCount: 14},
    ],
  },
  {
    id: '4',
    name: 'Cave Area',
    imageUrl: '/images/naastAchterkantMuur.jpg',
    description: 'Experience unique climbing angles in our cave section with roof and undercling features.',
    sectors: [
      {id: '10', name: 'Sector A', order: 1, boulderCount: 12},
      {id: '11', name: 'Sector B', order: 2, boulderCount: 12},
    ],
  },
]

export default function WallsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Climbing Walls</h1>
          <p className="text-muted-foreground">Explore our {walls.length} unique climbing walls and their sectors</p>
        </div>

        {/* Walls Grid */}
        <div className="space-y-8">
          {walls.map(wall => {
            const totalBoulders = wall.sectors.reduce((acc, sector) => acc + sector.boulderCount, 0)

            return (
              <Card key={wall.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="grid md:grid-cols-[300px_1fr] gap-6">
                  {/* Wall Image */}
                  <div className="aspect-[4/3] md:aspect-auto overflow-hidden rounded-xl">
                    <Image
                      src={wall.imageUrl || '/placeholder.svg'}
                      alt={wall.name}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Wall Info */}
                  <div className="p-6">
                    <CardHeader className="p-0 mb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-2xl mb-2">{wall.name}</CardTitle>
                          <CardDescription className="text-base">{wall.description}</CardDescription>
                        </div>
                        <Button asChild>
                          <Link href={`/walls/${wall.id}`}>
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>

                    {/* Stats */}
                    <div className="flex gap-6 mb-4">
                      <div>
                        <div className="text-2xl font-bold text-primary">{wall.sectors.length}</div>
                        <div className="text-sm text-muted-foreground">Sectors</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">{totalBoulders}</div>
                        <div className="text-sm text-muted-foreground">Boulders</div>
                      </div>
                    </div>

                    {/* Sectors */}
                    <div>
                      <h3 className="font-semibold mb-3">Sectors</h3>
                      <div className="flex flex-wrap gap-2">
                        {wall.sectors.map(sector => (
                          <Badge key={sector.id} variant="secondary" className="px-3 py-1">
                            {sector.name} ({sector.boulderCount})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
