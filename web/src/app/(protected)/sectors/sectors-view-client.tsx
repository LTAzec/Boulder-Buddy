'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, MapPin } from 'lucide-react'

import type { SectorForView } from '@/dal/sector.repo'

type Option = { value: string; label: string }

export default function SectorsViewClient({ sectors }: { sectors: SectorForView[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const searchParams = useSearchParams()

  const [search, setSearch] = useState('')
  const [wallId, setWallId] = useState('All')

  const wallOptions: Option[] = useMemo(() => {
    const map = new Map<string, string>() // wallId -> wallName
    sectors.forEach(s => {
      const id = s.wall?.id
      const name = s.wall?.name
      if (id && name) map.set(id, name)
    })
    const items = Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]))
    return [{ value: 'All', label: 'All' }, ...items.map(([value, label]) => ({ value, label }))]
  }, [sectors])

  useEffect(() => {
    const fromUrl = searchParams.get('wallId')
    if (!fromUrl) return
    const exists = wallOptions.some(o => o.value === fromUrl)
    if (exists) setWallId(fromUrl)
  }, [searchParams, wallOptions])

  const filtered = useMemo(() => {
    return sectors.filter(s => {
      const name = (s.name ?? '').toLowerCase()
      const wid = s.wall?.id ?? ''
      return (
        name.includes(search.toLowerCase()) &&
        (wallId === 'All' || wid === wallId)
      )
    })
  }, [sectors, search, wallId])

  return (
    <div className="container max-w-7xl mx-auto py-8">
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

            <FilterOption label="Wall" value={wallId} set={setWallId} options={wallOptions} />
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8">
          <CardContent className="text-muted-foreground">Loading filters…</CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(s => (
          <Card key={s.id} className="overflow-hidden p-0">
            <div className="relative aspect-[4/3] w-full rounded-t-xl overflow-hidden">
              <Image
                src={s.imageUrl ?? '/boulderPlaceholder.webp'}
                alt={s.name}
                fill
                className="object-cover"
              />
            </div>

            <CardHeader>
              <CardTitle>{s.name}</CardTitle>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {s.wall?.name ?? '—'}
              </div>
            </CardHeader>

            <CardContent className="flex flex-wrap gap-2">
              <Badge variant="outline">{s.wall?.name ?? '—'}</Badge>
              <Badge variant="secondary">Order: {s.order}</Badge>
            </CardContent>

            <CardFooter className="p-0">
              <Button asChild className="w-full rounded-xl py-6">
                {/* naar boulders met sectorId */}
                <Link href={`/boulders?sectorId=${s.id}`}>View boulders</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

function FilterOption({
  label,
  value,
  set,
  options,
}: {
  label: string
  value: string
  set: (v: string) => void
  options: Option[]
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Select value={value} onValueChange={set}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(o => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
