'use client'

import {LogoutButton} from './LogoutButton'

export function UserStatus({username}: {username: string}) {
  return (
    <div className="flex items-center gap-3 ">
      <div className="text-sm">
        Logged in as <span className="font-medium">{username}</span>
      </div>
      <LogoutButton />
    </div>
  )
}
