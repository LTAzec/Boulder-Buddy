'use client'

import {Button} from '@/components/ui/button'
import {signOutServerFunction} from '@/serverFunctions/users'

export function LogoutButton() {
  return (
    <Button
      variant="outline"
      onClick={async () => {
        await signOutServerFunction()
      }}>
      Logout
    </Button>
  )
}
