import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { Link, useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import LoadingScreen from '@/src/components/LoadingScreen'
import { listSectorsByWall, type Sector } from '@/src/api/sectors'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function WallDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const wallId = typeof id === 'string' ? id : ''

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['sectors', wallId],
    queryFn: () => listSectorsByWall(wallId),
    enabled: !!wallId, // voorkomt calls met "index undefined
  })

  if (!wallId) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red', fontWeight: '700' }}>Geen wallId gevonden.</Text>
      </View>
    )
  }

  if (isLoading) return <LoadingScreen label="Sectors laden…" />

  if (isError) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red', fontWeight: '700' }}>Kon sectoren niet laden.</Text>
        <Text>{msg}</Text>
      </View>
    )
  }

  const sectors = data ?? []

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Kies een sector</Text>

        {sectors.map((s: Sector) => (
          <Link
            key={s.id}
            href={{ pathname: '/home/sector/[id]', params: { id: s.id } }}
            asChild
          >
            <Pressable style={styles.card}>
              <Text style={styles.cardTitle}>{s.name}</Text>
              <Text style={styles.cardSub}>Tik om boulders te bekijken</Text>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  card: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 12, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSub: { marginTop: 4, color: '#666' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
})
