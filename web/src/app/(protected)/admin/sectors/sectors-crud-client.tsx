'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import type { SectorDto } from '@/actions/sector.actions'
import { sectorCreateAction, sectorUpdateAction, sectorDeleteAction } from '@/actions/sector.actions'
import { DataTable, type Column } from '@/components/crud/data-table'
import { CrudDialog } from '@/components/crud/crud-dialog'
import { DeleteDialog } from '@/components/crud/delete-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { showError } from '@/lib/showError'

type WallOption = {
    id: string
    name: string
}

type Props = {
    sectors: SectorDto[]
    walls: WallOption[]
}

export function SectorsCrudClient({ sectors, walls}: Props) {

    const router = useRouter()

    const [isSaving, setIsSaving] = React.useState(false)
    const [isDeleting, setIsDeleting] = React.useState(false)

    const [crudOpen, setCrudOpen] = React.useState(false)
    const [deleteOpen, setDeleteOpen] = React.useState(false)

    const [editing, setEditing] = React.useState<SectorDto | null>(null)

    const [name, setName] = React.useState('')
    const [wallId, setWallId] = React.useState<string>(walls[0]?.id ?? '')
    const [order, setOrder] = React.useState(0)

    const [imageUrl, setImageUrl] = React.useState('')
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
    const [isUploading, setIsUploading] = React.useState(false)

    const openCreate = () => {
        setEditing(null)
        setName('')
        setWallId(walls[0]?.id ?? '')
        setOrder(0)
        setCrudOpen(true)
        setImageUrl('')
        setSelectedFile(null)
    }

    const openEdit = (sector: SectorDto) => {
        setEditing(sector)
        setName(sector.name)
        setWallId(sector.wallId)
        setOrder(sector.order ?? 0)
        setCrudOpen(true)
        setImageUrl(sector.imageUrl ?? '')
        setSelectedFile(null)
    }

    const openDelete = (sector: SectorDto) => {
        setEditing(sector)
        setDeleteOpen(true)
    }

    const handleUpload = async () => {
        if (!selectedFile) {
            showError('No file selected')
            return
        }

        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', selectedFile)

            const res = await fetch('/api/uploads/sectors', {
                method: 'POST',
                body: formData,
            })

            const json = await res.json().catch(() => null)

            if (!res.ok || !json?.ok) {
                showError(json?.error || 'Upload failed')
                return
            }

            setImageUrl(json.url as string) // dit bewaren we in de DB
            setSelectedFile(null)
        } finally {
            setIsUploading(false)
        }
    }

    const handleSubmit = async () => {
        setIsSaving(true)
        try {
            if (editing) {
                const result = await sectorUpdateAction({ id: editing.id, name, wallId, order, imageUrl: imageUrl || undefined, })
                if (!result.ok) {
                    showError(result.error)
                    return
                }
            } else {
                const result = await sectorCreateAction({ name, wallId, order, imageUrl: imageUrl || undefined })
                if (!result.ok) {
                    showError(result.error)
                    return
                }
            }

            setCrudOpen(false)
            router.refresh()
        }finally {
            setIsSaving(false)
        }
    }

    const handleConfirmDelete = async () => {
        if (!editing) return    

        setIsDeleting(true)
        try {
            const result = await sectorDeleteAction({ id: editing.id })
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

    const columns: Column<SectorDto>[] = [
        {
            key: 'name',
            label: 'Name',
            sortable: true,
        },
        {
        key: 'wall',
        label: 'Wall',
        sortable: true,
        render: (s) => s.wall?.name ?? '—',
        },
        {
        key: 'order',
        label: 'Order',
        sortable: true,
        render: (s) => String(s.order ?? 0),
        },
        {
        key: 'createdAt',
        label: 'Created',
        sortable: true,
        render: (s) => {
            const d = typeof s.createdAt === 'string' ? new Date(s.createdAt) : s.createdAt
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
        render: (s) => (
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button variant="outline" size="sm" onClick={() => openEdit(s)}>
                Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => openDelete(s)}>
                Delete
            </Button>
            </div>
        ),
        },
    ] 

    return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{sectors.length} sector(s)</p>
        <Button onClick={openCreate} disabled={walls.length === 0}>
          Add sector
        </Button>
      </div>

      {walls.length === 0 ? (
        <div className="rounded-md border p-4 text-sm">
          You need to create at least one <b>Wall</b> before you can create sectors.
        </div>
      ) : null}

      <DataTable
        data={sectors}
        columns={columns}
        onRowClick={openEdit}
        searchPlaceholder="Search sectors..."
        emptyMessage="No sectors found"
      />

      <CrudDialog
        open={crudOpen}
        onOpenChange={setCrudOpen}
        title={editing ? 'Edit sector' : 'Create sector'}
        description={editing ? 'Update the sector details.' : 'Create a new sector.'}
        onSubmit={handleSubmit}
        submitLabel={editing ? 'Save' : 'Create'}
        isLoading={isSaving}
        onCancel={() => {
            setEditing(null)
            setName('')
            setWallId(walls[0]?.id ?? '')
            setOrder(0)
            setImageUrl('')
            setSelectedFile(null)
        }}
      >
        <div className="max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="sectorName">Name</Label>
                    <Input
                    id="sectorName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Left slab"
                    autoFocus
                    />
                </div>

                <div className="space-y-2">
                    <Label>Wall</Label>
                    <Select value={wallId} onValueChange={setWallId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a wall" />
                    </SelectTrigger>
                    <SelectContent>
                        {walls.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                            {w.name}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="sectorOrder">Order</Label>
                    <Input
                    id="sectorOrder"
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    min={0}
                    placeholder="0"
                    />
                </div>

                <div className="space-y-2">
                <Label>Sector image</Label>

                <Input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                />

                <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                >
                    {isUploading ? 'Uploading...' : 'Upload image'}
                </Button>

                <span className="text-sm text-muted-foreground">
                    {imageUrl ? imageUrl : 'No image uploaded yet'}
                </span>
                </div>

                {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={imageUrl}
                    alt="Sector preview"
                    className="mt-2 max-h-48 rounded-md border object-contain"
                />
                ) : null}
                </div>
            </div>
        </div>

        
      </CrudDialog>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        itemName={editing?.name}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}