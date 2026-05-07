'use client'

import * as React from 'react'
import {useRouter} from 'next/navigation'
import {DataTable, type Column} from '@/components/crud/data-table'
import {CrudDialog} from '@/components/crud/crud-dialog'
import {DeleteDialog} from '@/components/crud/delete-dialog'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {showError} from '@/lib/showError'
import {gymCreateAction, gymUpdateAction, gymDeleteAction} from '@/actions/gym.actions'
import type {GymDto} from '@/actions/gym.actions'

export default function GymsCrudClient({gyms}: {gyms: GymDto[]}) {
  const router = useRouter()

  const [isSaving, setIsSaving] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const [crudOpen, setCrudOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const [editing, setEditing] = React.useState<GymDto | null>(null)

  const [name, setName] = React.useState('')
  const [city, setCity] = React.useState('')

  const openCreate = () => {
    setEditing(null)
    setName('')
    setCity('')
    setCrudOpen(true)
  }

  const openEdit = (g: GymDto) => {
    setEditing(g)
    setName(g.name)
    setCity(g.city ?? '')
    setCrudOpen(true)
  }

  const openDelete = (g: GymDto) => {
    setEditing(g)
    setDeleteOpen(true)
  }

  const handleSubmit = async () => {
    setIsSaving(true)
    try {
      if (editing) {
        const result = await gymUpdateAction({id: editing.id, name, city: city || null})
        if (!result.ok) {
          showError(result.error)
          return
        }
      } else {
        const result = await gymCreateAction({name, city: city || null})
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

    const wallsCount = editing._count?.walls ?? 0
    if (wallsCount > 0) {
      showError('You cannot delete a gym that still has walls. Delete the walls first.')
      return
    }

    setIsDeleting(true)
    try {
      const result = await gymDeleteAction({id: editing.id})
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

  const columns: Column<GymDto>[] = [
    {key: 'name', label: 'Name', sortable: true},
    {key: 'city', label: 'City', sortable: true, render: (g) => g.city ?? '—'},
    {
      key: 'walls',
      label: 'Walls',
      sortable: true,
      render: (g) => String(g._count?.walls ?? 0),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (g) => {
        const d = typeof g.createdAt === 'string' ? new Date(g.createdAt) : g.createdAt
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
      render: (g) => {
        const wallsCount = g._count?.walls ?? 0

        return (
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button variant="outline" size="sm" onClick={() => openEdit(g)}>
              Edit
            </Button>

            <Button
              variant="destructive"
              size="sm"
              disabled={wallsCount > 0}
              title={wallsCount > 0 ? 'Delete walls first' : 'Delete gym'}
              onClick={() => {
                if (wallsCount > 0) {
                  showError('You cannot delete a gym that still has walls. Delete the walls first.')
                  return
                }
                openDelete(g)
              }}
            >
              Delete
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{gyms.length} gym(s)</p>
        <Button onClick={openCreate}>Add gym</Button>
      </div>

      <DataTable
        data={gyms}
        columns={columns}
        onRowClick={openEdit}
        searchPlaceholder="Search gyms..."
        emptyMessage="No gyms found"
      />

      <CrudDialog
        open={crudOpen}
        onOpenChange={setCrudOpen}
        title={editing ? 'Edit gym' : 'Create gym'}
        description={editing ? 'Update the gym details.' : 'Create a new gym.'}
        onSubmit={handleSubmit}
        submitLabel={editing ? 'Save' : 'Create'}
        isLoading={isSaving}
        onCancel={() => {
          setEditing(null)
          setName('')
          setCity('')
        }}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gymName">Name</Label>
            <Input
              id="gymName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Gustaaf"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gymCity">City</Label>
            <Input
              id="gymCity"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Turnhout"
            />
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
