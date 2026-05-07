import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@/src/auth/authProvider'

export default function LogoutScreen() {
  const { signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    void (async () => {
      await signOut()
      router.replace('/login' as never)
    })()
  }, [signOut, router])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator />
    </View>
  )
}
