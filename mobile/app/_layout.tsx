import { Stack, usePathname, useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import IntroLoading from './intro-loading'
import LoadingScreen from '@/src/components/LoadingScreen'
import { AuthProvider, useAuth } from '@/src/auth/authProvider'

const queryClient = new QueryClient()

function AppShell() {
  const pathname = usePathname()
  const router = useRouter()
  const { status } = useAuth()
  const [showIntro, setShowIntro] = useState(true)

  const handleDone = useCallback(() => setShowIntro(false), [])

  useEffect(() => {
    if (status === 'loading') return

    const isAuthScreen = pathname === '/login' || pathname === '/register'

    // niet ingelogd → altijd naar login
    if (status === 'anon' && !isAuthScreen) {
      router.replace('/login')
      return
    }

    // ingelogd → nooit login/register tonen
    if (status === 'authed' && isAuthScreen) {
      router.replace('/(tabs)/home')
    }
  }, [status, pathname, router])

  if (status === 'loading') {
    return <LoadingScreen label="Account laden…" />
  }

  return (
    <View style={styles.root}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Tabs = enige entry point na login */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Auth screens (geen navbar) */}
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
      </Stack>

      {showIntro && (
        <View style={styles.introOverlay} pointerEvents="auto">
          <IntroLoading onDone={handleDone} />
        </View>
      )}
    </View>
  )
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </QueryClientProvider>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  introOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    elevation: 999,
  },
})
