'use client'

import * as React from 'react'
import {useRouter} from 'next/navigation'
import type {Role} from '@/generated/prisma/client'
import type {AdminUserListItem} from '@/dal/users'
import {userAdminUpdateAction, userAdminDeleteAction} from '@/actions/user.actions'
import {DataTable, type Column} from '@/components/crud/data-table'
import {CrudDialog} from '@/components/crud/crud-dialog'
import {DeleteDialog} from '@/components/crud/delete-dialog'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from '@/components/ui/select'
import {showError} from '@/lib/showError'

type Props = {
  users: AdminUserListItem[]
}

export default function UsersCrudClient({users}: Props) {
  const router = useRouter()

  const [isSaving, setIsSaving] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const [crudOpen, setCrudOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const [editing, setEditing] = React.useState<AdminUserListItem | null>(null)

  const [username, setUsername] = React.useState('')
  const [role, setRole] = React.useState<Role>('User')

  const openEdit = (u: AdminUserListItem) => {
    setEditing(u)
    setUsername(u.username)
    setRole(u.role)
    setCrudOpen(true)
  }

  const openDelete = (u: AdminUserListItem) => {
    setEditing(u)
    setDeleteOpen(true)
  }

  const handleSubmit = async () => {
    if (!editing) return

    setIsSaving(true)
    try {
      const result = await userAdminUpdateAction({
        id: editing.id,
        username,
        role,
      })

      if (!result.ok) {
        showError(result.error)
        return
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
      const result = await userAdminDeleteAction({id: editing.id})

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

  const columns: Column<AdminUserListItem>[] = [
    {key: 'email', label: 'Email', sortable: true},
    {key: 'username', label: 'Username', sortable: true},
    {key: 'role', label: 'Role', sortable: true, render: (u) => u.role},
    {
      key: 'activity',
      label: 'Activity',
      render: (u) =>
        `S:${u._count.sessions} L:${u._count.logs} ❤️:${u._count.likes} 💬:${u._count.comments} Set:${u._count.bouldersSet}`,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (u) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" size="sm" onClick={() => openEdit(u)}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => openDelete(u)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{users.length} user(s)</p>
      </div>

      <DataTable
        data={users}
        columns={columns}
        onRowClick={openEdit}
        searchPlaceholder="Search users..."
        emptyMessage="No users found"
      />

      <CrudDialog
        open={crudOpen}
        onOpenChange={setCrudOpen}
        title="Edit user"
        description="Update the user details."
        onSubmit={handleSubmit}
        submitLabel="Save"
        isLoading={isSaving}
        onCancel={() => {
          setEditing(null)
          setUsername('')
          setRole('User')
        }}
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="text-sm font-medium">Email</div>
            <div className="text-sm text-muted-foreground">{editing?.email}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. yannis"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Setter">Setter</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CrudDialog>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        itemName={editing?.email}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
