import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { Link } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { listWalls, type Wall } from '@/src/api/walls'
import { SafeAreaView } from 'react-native-safe-area-context'
import LoadingScreen from '@/src/components/LoadingScreen'

export default function WallsScreen() {
  const { data, isLoading, isError, error } = useQuery<Wall[], Error>({
    queryKey: ['walls'],
    queryFn: () => listWalls(),
  })

  if (isLoading) {
    return <LoadingScreen label="loading…" />
  }

  if (isError) {
    const msg = error?.message ?? 'Unknown error'
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red', fontWeight: '600' }}>Kon muren niet laden.</Text>
        <Text>{msg}</Text>
      </View>
    )
  }

  const walls: Wall[] = data ?? []

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Kies een muur</Text>

        {walls.map((wall) => (
          <Link
            key={wall.id}
            href={{ pathname: '/home/wall/[id]', params: { id: wall.id } }}
            asChild
          >
            <Pressable style={styles.card}>
              <Text style={styles.cardTitle}>{wall.name}</Text>
              <Text style={styles.cardSub}>Tik om sectoren te bekijken</Text>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16, paddingBottom: 32, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  card: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 12, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  cardSub: { marginTop: 4, color: '#666' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
})
