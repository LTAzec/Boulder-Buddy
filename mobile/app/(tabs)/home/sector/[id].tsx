import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native'
import { Link, useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { SafeAreaView } from 'react-native-safe-area-context'
import LoadingScreen from '@/src/components/LoadingScreen'
import { getSectorById, type SectorDetail } from '@/src/api/sectors'
import { resolvePublicUrl } from '@/lib/resolveUrl'

export default function SectorDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const sectorId = typeof id === 'string' ? id : ''

  const { data, isLoading, isError, error } = useQuery<SectorDetail, Error>({
    queryKey: ['sector', sectorId],
    queryFn: () => getSectorById(sectorId),
    enabled: !!sectorId,
  })

  if (!sectorId) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.error}>Geen sectorId gevonden.</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (isLoading) {
    return <LoadingScreen label="Walls laden…" />
  }


  if (isError) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.error}>Kon sector niet laden.</Text>
          <Text style={styles.mono}>{msg}</Text>
        </View>
      </SafeAreaView>
    )
  }

  const sector = data
  if (!sector) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text>Sector niet gevonden.</Text>
        </View>
      </SafeAreaView>
    )
  }

  const boulders = (sector.boulders ?? []).filter((b) => b.isActive !== false)
  const sectorImg = resolvePublicUrl(sector.imageUrl)

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{sector.name ?? 'Sector'}</Text>

        <Text style={styles.subtitle}>
          {sector.wall?.name ? `Muur: ${sector.wall.name} • ` : ''}
          Boulders: {boulders.length}
        </Text>

        {sectorImg ? (
          <Image
            source={{ uri: sectorImg }}
            style={styles.sectorImage}
            onError={(e) =>
              console.log('❌ sector detail image error', {
                sectorId: sector.id,
                url: sectorImg,
                err: e.nativeEvent,
              })
            }
          />
        ) : (
          <View style={[styles.sectorImage, styles.imagePlaceholder]}>
            <Text style={{ color: '#777' }}>Nog geen foto</Text>
          </View>
        )}

        <View style={{ height: 16 }} />

        {boulders.length === 0 ? (
          <Text style={styles.empty}>Geen actieve boulders in deze sector.</Text>
        ) : (
          boulders.map((b) => (
            <Link
              key={b.id}
              href={{ pathname: '/home/boulder/[id]', params: { id: b.id } }}
              asChild
            >
              <Pressable style={styles.card}>
                <Text style={styles.cardTitle}>{b.name ?? 'Naamloze boulder'}</Text>
                <Text style={styles.small}>
                  {b.grade} • {b.color}
                </Text>
                <Text style={styles.smallMuted}>Active: {String(b.isActive)}</Text>
              </Pressable>
            </Link>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16, paddingBottom: 32, backgroundColor: '#fff' },

  title: { fontSize: 22, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 12 },

  sectorImage: { width: '100%', height: 160, borderRadius: 12, backgroundColor: '#ddd', marginTop: 10 },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee' },

  card: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 12, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  small: { marginTop: 6, color: '#333' },
  smallMuted: { marginTop: 4, color: '#777', fontSize: 12 },

  empty: { textAlign: 'center', color: '#666', marginTop: 16 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  error: { color: 'red', fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  mono: { fontFamily: 'monospace', fontSize: 12, textAlign: 'center' },
})
