import { Tabs, usePathname } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '@/src/auth/authProvider'
import { useState } from 'react'
import { Colors} from '@/src/components/color'

const ACCENT = Colors.accent
const INACTIVE = Colors.innactive
const BG = Colors.text.dark

export default function TabsLayout() {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const pathname = String(usePathname())
  const [role] = useState(user?.role ?? 'User')
  const [canManage] = useState(role === 'Setter' || role === 'Admin' || role === 'SuperAdmin')

  const wallsActive =
    pathname.startsWith('/(tabs)/(main)/admin/wallCrud')

  const sectorsActive =
    pathname.startsWith('/(tabs)/(main)/admin/sectorCrud')

  const bouldersActive =
    pathname.startsWith('/(tabs)/(main)/admin/boulderCrud')

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: BG,
          borderTopWidth: 0,
          height: 56 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
      }}
    >
      {/* hidden group */}
      <Tabs.Screen name="(main)" options={{ href: null }} />



      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />

      {/* Admin tabs: altijd aanwezig als route, maar verborgen voor users via href:null */}
      <Tabs.Screen
        name="walls"
        options={{
          title: 'Walls',
          href: canManage ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="apps-outline" color={wallsActive ? ACCENT : color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="sectors"
        options={{
          title: 'Sectors',
          href: canManage ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="albums-outline" color={sectorsActive ? ACCENT : color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="boulders"
        options={{
          title: 'Boulders',
          href: canManage ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flash-outline"  color={bouldersActive ? ACCENT : color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="logout"
        options={{
          title: 'Logout',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="log-out-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  )
}
