import {listUsersForAdmin} from '@/dal/users'
import UsersCrudClient from './users-crud-client'

export default async function UsersPage() {
  const users = await listUsersForAdmin()

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Users</h1>
      <UsersCrudClient users={users} />
    </div>
  )
}
