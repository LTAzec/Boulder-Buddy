'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import type { TagDto } from '@/actions/tag.actions'
import { createTag, deleteTag, updateTag } from '@/actions/tag.actions'
import { DataTable, type Column } from '@/components/crud/data-table'
import { CrudDialog } from '@/components/crud/crud-dialog'
import { DeleteDialog } from '@/components/crud/delete-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Props = {
  tags: TagDto[]
}

export function TagsCrudClient({ tags }: Props) {
  const router = useRouter()

  const [isSaving, setIsSaving] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const [crudOpen, setCrudOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const [editing, setEditing] = React.useState<TagDto | null>(null)
  const [name, setName] = React.useState('')

  const openCreate = () => {
    setEditing(null)
    setName('')
    setCrudOpen(true)
  }

  const openEdit = (tag: TagDto) => {
    setEditing(tag)
    setName(tag.name)
    setCrudOpen(true)
  }

  const openDelete = (tag: TagDto) => {
    setEditing(tag)
    setDeleteOpen(true)
  }

  const handleSubmit = async () => {
    setIsSaving(true)
    try {
      if (editing) {
        const res = await updateTag({ id: editing.id, name })
        if (!res.ok) {
          window.alert(res.error)
          return
        }
      } else {
        const res = await createTag({ name })
        if (!res.ok) {
          window.alert(res.error)
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
      const res = await deleteTag({ id: editing.id })
      if (!res.ok) {
        window.alert(res.error)
        return
      }

      setDeleteOpen(false)
      router.refresh()
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: Column<TagDto>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (t) => {
        const d = typeof t.createdAt === 'string' ? new Date(t.createdAt) : t.createdAt
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
      render: (t) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" size="sm" onClick={() => openEdit(t)}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => openDelete(t)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{tags.length} tag(s)</p>
        <Button onClick={openCreate}>Add tag</Button>
      </div>

      <DataTable
        data={tags}
        columns={columns}
        onRowClick={openEdit}
        searchPlaceholder="Search tags..."
        emptyMessage="No tags found"
      />

      <CrudDialog
        open={crudOpen}
        onOpenChange={setCrudOpen}
        title={editing ? 'Edit tag' : 'Create tag'}
        description={editing ? 'Update the tag name.' : 'Create a new tag.'}
        onSubmit={handleSubmit}
        submitLabel={editing ? 'Save' : 'Create'}
        isLoading={isSaving}
        onCancel={() => {
          setEditing(null)
          setName('')
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="tagName">Name</Label>
          <Input
            id="tagName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. slopers"
            autoFocus
          />
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
