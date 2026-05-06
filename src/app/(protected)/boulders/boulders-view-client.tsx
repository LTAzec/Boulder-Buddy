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
import type { BoulderColor, BoulderGrade } from '@/generated/prisma/enums'

type ViewBoulder = {
  id: string
  name?: string | null
  color: BoulderColor
  grade: BoulderGrade
  imageUrl?: string | null
  sector?: {
    id: string
    name: string
    wall?: { id: string; name: string }
  } | null
  tags?: Array<{ tag: { name: string } }>
}

type Option = { value: string; label: string }

function prettyGrade(grade: string) {
  return grade
    .replace(/^FB_/, '')
    .replace(/_PLUS$/, '+')
    .replace(/_/g, '')
}

export default function BouldersViewClient({ boulders }: { boulders: ViewBoulder[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const searchParams = useSearchParams()

  const [search, setSearch] = useState('')
  const [color, setColor] = useState('All')
  const [grade, setGrade] = useState('All')
  const [sectorId, setSectorId] = useState('All')
  const [tag, setTag] = useState('All')

  //options uit DB (raw values)
  const colorOptions = useMemo(() => {
    const set = new Set<string>()
    boulders.forEach(b => set.add(String(b.color)))
    return ['All', ...Array.from(set).sort()]
  }, [boulders])

  const gradeOptions = useMemo(() => {
    const set = new Set<string>()
    boulders.forEach(b => set.add(String(b.grade)))
    return ['All', ...Array.from(set).sort()]
  }, [boulders])

  const sectorOptions: Option[] = useMemo(() => {
    const map = new Map<string, string>() // sectorId -> label
    boulders.forEach(b => {
      const id = b.sector?.id
      const sectorName = b.sector?.name
      if (!id || !sectorName) return
      const wallName = b.sector?.wall?.name
      const label = wallName ? `${wallName} - ${sectorName}` : sectorName
      map.set(id, label)
    })
    const items = Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]))
    return [{ value: 'All', label: 'All' }, ...items.map(([value, label]) => ({ value, label }))]
  }, [boulders])

  const tagOptions = useMemo(() => {
    const set = new Set<string>()
    boulders.forEach(b => b.tags?.forEach(t => set.add(t.tag.name)))
    return ['All', ...Array.from(set).sort()]
  }, [boulders])

  //URL -> state (preselect sector)
  useEffect(() => {
    const fromUrl = searchParams.get('sectorId')
    if (!fromUrl) return
    const exists = sectorOptions.some(o => o.value === fromUrl)
    if (exists) setSectorId(fromUrl)
  }, [searchParams, sectorOptions])

  const filtered = useMemo(() => {
    return boulders.filter(b => {
      const name = (b.name ?? '').toLowerCase()
      const matchesSearch = name.includes(search.toLowerCase())
      const matchesColor = color === 'All' || String(b.color) === color
      const matchesGrade = grade === 'All' || String(b.grade) === grade
      const matchesSector = sectorId === 'All' || (b.sector?.id ?? '') === sectorId
      const matchesTag = tag === 'All' || b.tags?.some(t => t.tag.name === tag)

      return matchesSearch && matchesColor && matchesGrade && matchesSector && matchesTag
    })
  }, [boulders, search, color, grade, sectorId, tag])

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

            <Filter label="Color" value={color} set={setColor} options={colorOptions} />
            <Filter label="Grade" value={grade} set={setGrade} options={gradeOptions} formatLabel={(v) => (v === 'All' ? 'All' : prettyGrade(v))} />
            <FilterOption label="Sector" value={sectorId} set={setSectorId} options={sectorOptions} />
            <Filter label="Tag" value={tag} set={setTag} options={tagOptions} />
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8">
          <CardContent className="text-muted-foreground">Loading filters…</CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(b => {
          const sectorLabel = b.sector?.wall?.name && b.sector?.name
            ? `${b.sector.wall.name} - ${b.sector.name}`
            : b.sector?.name ?? '—'

          return (
            <Card key={b.id} className="overflow-hidden p-0">
              <div className="grid grid-cols-1 sm:grid-cols-[240px_1fr]">
                {/* LEFT: portrait image */}
                <div className="relative">
                  <div className="relative aspect-[3/4] sm:aspect-auto sm:h-full min-h-[320px]">
                    <Image
                      src={b.imageUrl ?? '/boulderPlaceholder.webp'}
                      alt={b.name ?? 'Boulder'}
                      fill
                      className="object-cover object-top"
                    />

                    {/* Grade overlay */}
                    <div className="absolute bottom-3 right-3">
                      <Badge className="text-lg px-3 py-1">
                        {prettyGrade(String(b.grade))}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* RIGHT: content */}
                <div className="flex flex-col pt-4 sm:pt-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-1">{b.name ?? 'Unnamed Boulder'}</CardTitle>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">
                        {b.sector?.wall?.name && b.sector?.name
                          ? `${b.sector.wall.name} - ${b.sector.name}`
                          : b.sector?.name ?? '—'}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-wrap gap-2 pt-0">
                    <Badge>{prettyGrade(String(b.grade))}</Badge>
                    <Badge variant="outline">{String(b.color)}</Badge>

                    {b.tags?.slice(0, 5).map(t => (
                      <Badge key={t.tag.name} variant="secondary">
                        {t.tag.name}
                      </Badge>
                    ))}
                  </CardContent>

                  {/* push footer to bottom */}
                  <div className="mt-auto">
                    <CardFooter className="p-0">
                      <Button asChild className="w-full rounded-br-xl rounded-tr-xl rounded-tl-xl rounded-bl-none py-6">
                        <Link href={`/boulders/${b.id}` as any}>View details</Link>
                      </Button>
                    </CardFooter>
                  </div>
                </div>
              </div>
            </Card>

          )
        })}
      </div>
    </div>
  )
}

function Filter({
  label,
  value,
  set,
  options,
  formatLabel,
}: {
  label: string
  value: string
  set: (v: string) => void
  options: string[]
  formatLabel?: (v: string) => string
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
            <SelectItem key={o} value={o}>
              {formatLabel ? formatLabel(o) : o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
