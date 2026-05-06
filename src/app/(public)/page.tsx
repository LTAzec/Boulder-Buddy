import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {MapPin, Mountain, ArrowRight} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Mock data - replace with actual database queries
const gymInfo = {
  name: 'Boulder Buddy, Gustaaf klimt',
  city: 'Turnhout',
  description:
    "Welcome to Gustaaf Bouldering, Turnhout's premier climbing destination. Experience world-class boulder problems across our diverse walls and sectors.",
}

const walls = [
  {
    id: '1',
    name: 'Main Wall',
    imageUrl: '/images/muurNaastOverhang.jpg',
    sectorCount: 4,
    boulderCount: 45,
  },
  {
    id: '2',
    name: 'Overhang Zone',
    imageUrl: '/images/trainingMuur.jpg',
    sectorCount: 3,
    boulderCount: 32,
  },
  {
    id: '3',
    name: 'Slab Section',
    imageUrl: '/images/muurTegenInkom.jpg',
    sectorCount: 2,
    boulderCount: 28,
  },
  {
    id: '4',
    name: 'Cave Area',
    imageUrl: '/images/trainingMuur.jpg',
    sectorCount: 2,
    boulderCount: 24,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="container max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <Mountain className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-balance">{gymInfo.name}</h1>
          <div className="flex items-center justify-center gap-2 mb-6">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">{gymInfo.city}</p>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty leading-relaxed">
            {gymInfo.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Button asChild size="lg">
              <Link href="/boulders">
                Explore Boulders <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/walls">View All Walls</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 border-y border-border bg-muted/30">
        <div className="container max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{walls.length}</div>
              <div className="text-sm text-muted-foreground">Walls</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {walls.reduce((acc, wall) => acc + wall.sectorCount, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Sectors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {walls.reduce((acc, wall) => acc + wall.boulderCount, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Boulders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">3-7b</div>
              <div className="text-sm text-muted-foreground">Grades</div>
            </div>
          </div>
        </div>
      </section>

      {/* Walls Section */}
      <section className="py-16 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Our Walls</h2>
              <p className="text-muted-foreground">Discover our diverse climbing areas</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/walls">View All</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {walls.map(wall => (
              <Card key={wall.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[4/3] overflow-hidden rounded-xl">
                  <Image
                    src={wall.imageUrl || '/placeholder.svg'}
                    alt={wall.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{wall.name}</CardTitle>
                  <CardDescription className="flex items-center gap-4">
                    <span>{wall.sectorCount} sectors</span>
                    <span>•</span>
                    <span>{wall.boulderCount} boulders</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="secondary" className="w-full" size="sm">
                    <Link href={"/walls"}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Ready to Start Climbing?</h2>
          <p className="text-lg mb-8 text-primary-foreground/90 text-pretty leading-relaxed">
            Browse our current boulder problems and track your progress
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/boulders">Explore Boulders</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Gustaaf Bouldering Gym - Turnhout. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
