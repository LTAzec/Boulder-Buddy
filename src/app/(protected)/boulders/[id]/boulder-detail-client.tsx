'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MapPin, Play, Calendar, User } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import type { BoulderDetailForView } from '@/dal/boulder.repo'

type Comment = {
  id: string
  userId: string
  username: string
  body: string
  createdAt: string
  avatar: string | null
}

function prettyGrade(grade: string) {
  return grade.replace(/^FB_/, '').replace(/_PLUS$/, '+').replace(/_/g, '')
}

function formatDateBE(date: Date) {
  return new Intl.DateTimeFormat('nl-BE', {
    timeZone: 'Europe/Brussels',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export default function BoulderDetailClient({
  boulder,
  mockComments,
  showAdminButton,
}: {
  boulder: NonNullable<BoulderDetailForView>
  mockComments: Comment[]
  showAdminButton: boolean
}) {
  const sectorLabel =
    boulder.sector?.wall?.name && boulder.sector?.name
      ? `${boulder.sector.wall.name} - ${boulder.sector.name}`
      : boulder.sector?.name ?? '—'

  const tags = (boulder.tags ?? []).map(t => t.tag.name)

  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <Button asChild variant="outline">
          <Link href="/boulders">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>

        {showAdminButton && (
          <Button asChild>
            <Link href="/admin/boulders">Beheer boulders</Link>
          </Button>
        )}
      </div>

      {/* Hero */}
      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr]">
          {/* Image */}
          <div className="relative bg-muted">
            <div className="relative aspect-[3/4] w-full">
              <Image
                src={boulder.imageUrl ?? '/boulderPlaceholder.webp'}
                alt={boulder.name ?? 'Boulder'}
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 lg:p-8 space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="text-lg px-3 py-1">{prettyGrade(String(boulder.grade))}</Badge>
                <Badge variant="outline">{String(boulder.color)}</Badge>
                {boulder.isActive === false ? <Badge variant="destructive">Inactive</Badge> : null}
              </div>

              <h1 className="text-3xl font-bold">{boulder.name ?? 'Unnamed Boulder'}</h1>

              <div className="text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{sectorLabel}</span>
              </div>
            </div>

            {/* Meta */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">Set date</div>
                    <div className="font-medium">
                      {boulder.setDate ? formatDateBE(new Date(boulder.setDate)) : '—'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-start gap-3">
                  <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">Set by</div>
                    <div className="font-medium">{boulder.setBy?.email ?? '—'}</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tags */}
            <div>
              <div className="text-sm text-muted-foreground mb-2">Tags</div>
              {tags.length ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map(t => (
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No tags</div>
              )}
            </div>

            {/* Shortcut */}
            {boulder.sector?.id ? (
              <Button asChild variant="secondary" className="w-full">
                <Link href={`/boulders?sectorId=${boulder.sector.id}`}>
                  View all boulders in this sector
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </Card>

      {/* Video + Comments (zoals je al had) */}
      <Card>
        <CardHeader>
          <CardTitle>Video & Comments</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
            <div>
              {boulder.videoUrl ? (
                <div className="rounded-xl overflow-hidden border bg-muted max-w-[360px]">
                  <video src={boulder.videoUrl} controls className="w-full h-auto" />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  No video available
                </div>
              )}
            </div>

            <div className="space-y-4">
              {mockComments.length ? (
                mockComments.map(c => (
                  <div key={c.id} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="font-medium">{c.username}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateBE(new Date(c.createdAt))}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">{c.body}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No comments yet.</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
