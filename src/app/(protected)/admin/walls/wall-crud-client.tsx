'use client'

import * as React from 'react'
import {createWallAction, updateWallAction, deleteWallAction} from '@/actions/wall.actions'
import {showError} from '@/lib/showError'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from '@/components/ui/dialog'
import {DataTable, type Column} from '@/components/crud/data-table'
import type {WallDto} from '@/actions/wall.actions'
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from '@/components/ui/select'
import {useRouter} from 'next/navigation'

type GymOption = {
  id: string
  name: string
}

type Props = {
  initialWalls: WallDto[]
  gyms: GymOption[]
}

export default function WallsCrudClient({initialWalls, gyms}: Props) {
  const [rows, setRows] = React.useState<WallDto[]>(initialWalls)
  const [open, setOpen] = React.useState(false)
  const [mode, setMode] = React.useState<'create' | 'edit'>('create')
  const [activeRow, setActiveRow] = React.useState<WallDto | null>(null)

  const [name, setName] = React.useState('')
  const [gymId, setGymId] = React.useState<string>(gyms[0]?.id ?? '')

  React.useEffect(() => {
    setRows(initialWalls)
  }, [initialWalls])

  const router = useRouter()

  function resetForm() {
    setName('')
    setGymId(gyms[0]?.id ?? '')
    setActiveRow(null)
  }

  function openCreate() {
    resetForm()
    setMode('create')
    setOpen(true)
  }

  function openEdit(row: WallDto) {
    setActiveRow(row)
    setName(row.name ?? '')
    setGymId(row.gymId ?? gyms[0]?.id ?? '')
    setMode('edit')
    setOpen(true)
  }

  async function onSave() {
    try {
      if (mode === 'create') {
        const res = await createWallAction({
          name,
          gymId,
        })
        if (!res.ok) throw res.error

        setOpen(false)
        resetForm()
        router.refresh()
        return
      }

      if (!activeRow) return

      const res = await updateWallAction({
        id: activeRow.id,
        name,
        gymId,
      })
      if (!res.ok) throw res.error

      const updated = res.data as any
      setRows((prev) => prev.map((r) => (r.id === activeRow.id ? {...r, ...updated} : r)))

      setOpen(false)
      resetForm()
      router.refresh()
    } catch (err) {
      showError(err)
    }
  }

  async function onDelete(row: WallDto) {
    const ok = confirm(`Delete wall "${row.name}"?\nSectors onder deze wall worden ook verwijderd.`)
    if (!ok) return

    try {
      const res = await deleteWallAction({id: row.id})
      if (!res.ok) throw res.error
      setRows((prev) => prev.filter((r) => r.id !== row.id))
    } catch (err) {
      showError(err)
    }
  }

  const columns: Column<WallDto>[] = [
    {key: 'name', label: 'Name', sortable: true},
    {
      key: 'gym',
      label: 'Gym',
      sortable: true,
      render: (w) => w.gym?.name ?? '—',
    },
    {
      key: 'sectors',
      label: 'Sectors',
      sortable: true,
      render: (w) => String(w._count?.sectors ?? 0),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (w) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" size="sm" onClick={() => openEdit(w)}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(w)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{rows.length} walls</div>
        <Button onClick={openCreate} disabled={gyms.length === 0}>
          Add wall
        </Button>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        onRowClick={openEdit}
        searchPlaceholder="Search wall..."
        emptyMessage="No walls found"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{mode === 'create' ? 'Create wall' : 'Edit wall'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Gym</Label>
              <Select value={gymId} onValueChange={setGymId} disabled={gyms.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a gym" />
                </SelectTrigger>
                <SelectContent>
                  {gyms.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <p className="text-xs text-muted-foreground">
                Gym wordt gekozen via dropdown.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button onClick={onSave} disabled={name.length === 0}>
              {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
