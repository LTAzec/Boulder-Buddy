'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, MapPin } from 'lucide-react'
import type { WallForView } from '@/dal/wall.repo'

export default function WallsViewClient({ walls }: { walls: WallForView[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return walls.filter(w => (w.name ?? '').toLowerCase().includes(search.toLowerCase()))
  }, [walls, search])

  return (
    <div className="container max-w-7xl mx-auto py-8">
      {/* FILTERS */}
      {mounted ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8">
          <CardContent className="text-muted-foreground">Loading filters…</CardContent>
        </Card>
      )}

      {/* GRID */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(w => (
          <Card key={w.id} className="overflow-hidden p-0">
            <div className="relative aspect-[4/3] w-full rounded-t-xl overflow-hidden">
              <Image
                src={w.imageUrl ?? '/boulderPlaceholder.webp'}
                alt={w.name}
                fill
                className="object-cover"
              />
            </div>

            <CardHeader>
              <CardTitle>{w.name}</CardTitle>

              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {w.gym?.name ?? '—'}
              </div>
            </CardHeader>

            <CardContent className="flex flex-wrap gap-2">
              <Badge variant="secondary">{w._count?.sectors ?? 0} sectors</Badge>
              <Badge variant="outline">{w.gym?.name ?? '—'}</Badge>
            </CardContent>

            <CardFooter className="p-0">
              <Button asChild className="w-full rounded-xl py-6">
                <Link href={`/sectors?wallId=${w.id}`}>View details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
