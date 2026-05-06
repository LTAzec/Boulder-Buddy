'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { boulderCreateAction, boulderUpdateAction, boulderDeleteAction } from '@/actions/boulder.actions'
import type { BoulderDto } from '@/actions/boulder.actions'
import { BoulderColor, BoulderGrade } from '@/generated/prisma/enums'
import { DataTable, type Column } from '@/components/crud/data-table'
import { CrudDialog } from '@/components/crud/crud-dialog'
import { DeleteDialog } from '@/components/crud/delete-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { showError } from '@/lib/showError'
import { UploadField } from '@/components/uploads/uploadField'

type TagOption = {
  id: string
  name: string
}

type SectorOption = {
  id: string
  name: string
}

type Props = {
  boulders: BoulderDto[]
  sectors: SectorOption[]
  tags: TagOption[]
}

const COLOR_OPTIONS = Object.values(BoulderColor)
const GRADE_OPTIONS = Object.values(BoulderGrade)

export function BouldersCrudClient({ boulders, sectors, tags }: Props) {
  const router = useRouter()

  const [isSaving, setIsSaving] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const [crudOpen, setCrudOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const [editing, setEditing] = React.useState<BoulderDto | null>(null)

  const [name, setName] = React.useState('')
  const [sectorId, setSectorId] = React.useState<string>(sectors[0]?.id ?? '')
  const [color, setColor] = React.useState<BoulderColor>(COLOR_OPTIONS[0] as BoulderColor)
  const [grade, setGrade] = React.useState<BoulderGrade>(GRADE_OPTIONS[0] as BoulderGrade)
  const [isActive, setIsActive] = React.useState(true)

  const [imageUrl, setImageUrl] = React.useState('')
  const [videoUrl, setVideoUrl] = React.useState('')

  const [posX, setPosX] = React.useState<number | ''>('')
  const [posY, setPosY] = React.useState<number | ''>('')

  const [selectedTagIds, setSelectedTagIds] = React.useState<string[]>([])

  const resetForm = () => {
    setName('')
    setSectorId(sectors[0]?.id ?? '')
    setColor(COLOR_OPTIONS[0] as BoulderColor)
    setGrade(GRADE_OPTIONS[0] as BoulderGrade)
    setIsActive(true)
    setImageUrl('')
    setVideoUrl('')
    setPosX('')
    setPosY('')
    setSelectedTagIds([])
  }

  const openCreate = () => {
    setEditing(null)
    resetForm()
    setCrudOpen(true)
  }

  const openEdit = (boulder: BoulderDto) => {
    setEditing(boulder)
    setName(boulder.name ?? '')
    setSectorId(boulder.sectorId)
    setColor(boulder.color)
    setGrade(boulder.grade)
    setIsActive(!!boulder.isActive)
    setImageUrl(boulder.imageUrl ?? '')
    setVideoUrl(boulder.videoUrl ?? '')
    setPosX(boulder.posX ?? '')
    setPosY(boulder.posY ?? '')
    setSelectedTagIds((boulder.tags ?? []).map((t) => t.tag.id))
    setCrudOpen(true)
  }

  const openDelete = (boulder: BoulderDto) => {
    setEditing(boulder)
    setDeleteOpen(true)
  }

  const handleSubmit = async () => {
    setIsSaving(true)
    try {
      const payload = {
        name: name.trim() ? name.trim() : null,
        sectorId,
        color,
        grade,
        isActive,
        imageUrl: imageUrl || undefined,
        videoUrl: videoUrl || undefined,
        posX: posX === '' ? undefined : Number(posX),
        posY: posY === '' ? undefined : Number(posY),
        tagIds: selectedTagIds.length ? selectedTagIds : undefined,
      }

      if (editing) {
        const result = await boulderUpdateAction({ id: editing.id, ...payload })
        if (!result.ok) {
          showError(result.error)
          return
        }
      } else {
        const result = await boulderCreateAction(payload)
        if (!result.ok) {
          showError(result.error)
          return
        }
      }

      setCrudOpen(false)
      router.refresh()
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!editing) return

    setIsDeleting(true)
    try {
      const result = await boulderDeleteAction({ id: editing.id })
      if (!result.ok) {
        showError(result.error)
        return
      }

      setDeleteOpen(false)
      router.refresh()
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: Column<BoulderDto>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (b) => b.name ?? '—',
    },
    {
      key: 'sector',
      label: 'Sector',
      sortable: true,
      render: (b) => (b.sector ? `${b.sector.wall?.name ?? 'Wall'} • ${b.sector.name}` : '—'),
    },
    {
      key: 'color',
      label: 'Color',
      sortable: true,
      render: (b) => String(b.color),
    },
    {
      key: 'grade',
      label: 'Grade',
      sortable: true,
      render: (b) => String(b.grade).replace('FB_', ''),
    },
    {
      key: 'isActive',
      label: 'Active',
      sortable: true,
      render: (b) => (b.isActive ? 'Yes' : 'No'),
    },
    {
      key: 'setDate',
      label: 'Set date',
      sortable: true,
      render: (b) => {
        const d = typeof b.setDate === 'string' ? new Date(b.setDate) : b.setDate
        return new Intl.DateTimeFormat('nl-BE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'Europe/Brussels',
        }).format(d)
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (b) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" size="sm" onClick={() => openEdit(b)}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => openDelete(b)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{boulders.length} boulder(s)</p>
        <Button onClick={openCreate} disabled={sectors.length === 0}>
          Add boulder
        </Button>
      </div>

      {sectors.length === 0 ? (
        <div className="rounded-md border p-4 text-sm">
          You need to create at least one <b>Sector</b> before you can create boulders.
        </div>
      ) : null}

      <DataTable
        data={boulders}
        columns={columns}
        onRowClick={openEdit}
        searchPlaceholder="Search boulders..."
        emptyMessage="No boulders found"
      />

      <CrudDialog
        open={crudOpen}
        onOpenChange={setCrudOpen}
        title={editing ? 'Edit boulder' : 'Create boulder'}
        description={editing ? 'Update the boulder details.' : 'Create a new boulder.'}
        onSubmit={handleSubmit}
        submitLabel={editing ? 'Save' : 'Create'}
        isLoading={isSaving}
        onCancel={() => {
          setEditing(null)
          resetForm()
        }}
      >
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="boulderName">Name (optional)</Label>
              <Input
                id="boulderName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Blue dyno"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>Sector</Label>
              <Select value={sectorId} onValueChange={setSectorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a sector" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Color</Label>
                <Select value={String(color)} onValueChange={(v) => setColor(v as BoulderColor)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLOR_OPTIONS.map((c) => (
                      <SelectItem key={String(c)} value={String(c)}>
                        {String(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Grade</Label>
                <Select value={String(grade)} onValueChange={(v) => setGrade(v as BoulderGrade)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_OPTIONS.map((g) => (
                      <SelectItem key={String(g)} value={String(g)}>
                        {String(g).replace('FB_', '')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Active</Label>
              <Select value={isActive ? 'true' : 'false'} onValueChange={(v) => setIsActive(v === 'true')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <UploadField
                key={`boulder-image-${crudOpen}-${editing?.id ?? 'new'}`}
                label="Boulder image (optional)"
                endpoint="/api/uploads/boulders-images"
                accept="image/*"
                value={imageUrl}
                onUploaded={setImageUrl}
                buttonText="Upload image"
                preview="image"
            />

            <UploadField
                key={`boulder-video-${crudOpen}-${editing?.id ?? 'new'}`}
                label="Boulder video (optional)"
                endpoint="/api/uploads/boulders-videos"
                accept="video/mp4,video/webm,video/quicktime"
                value={videoUrl}
                onUploaded={setVideoUrl}
                buttonText="Upload video"
                preview="video"
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="posX">posX (optional)</Label>
                <Input
                  id="posX"
                  type="number"
                  value={posX}
                  onChange={(e) => setPosX(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="posY">posY (optional)</Label>
                <Input
                  id="posY"
                  type="number"
                  value={posY}
                  onChange={(e) => setPosY(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 0"
                />
              </div>
            </div>

            {tags.length ? (
              <div className="space-y-2">
                <Label>Tags (optional)</Label>

                <div className="grid grid-cols-2 gap-2">
                  {tags.map((t) => {
                    const checked = selectedTagIds.includes(t.id)
                    return (
                      <label key={t.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setSelectedTagIds((prev) =>
                              e.target.checked ? [...prev, t.id] : prev.filter((id) => id !== t.id),
                            )
                          }}
                        />
                        {t.name}
                      </label>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </CrudDialog>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        itemName={editing?.name ?? 'Boulder'}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
