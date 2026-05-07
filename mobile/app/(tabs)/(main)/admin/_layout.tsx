import { Stack, Redirect } from 'expo-router'
import { useAuth } from '@/src/auth/authProvider'

export default function AdminLayout() {
  const { status, user } = useAuth()

  if (status === 'loading') return null

  const role = user?.role ?? 'User'
  const canManage = role === 'Admin' || role === 'Setter'

  if (!canManage) {
    return <Redirect href={'/(main)' as never} />
  }

  return <Stack screenOptions={{ headerShown: false }} />
}
