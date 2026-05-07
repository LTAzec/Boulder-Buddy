import { Image, ScrollView, StyleSheet, Text, View, Share, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Video, ResizeMode, type AVPlaybackStatus } from 'expo-av'
import LoadingScreen from '@/src/components/LoadingScreen'
import { getBoulderById, type BoulderDetail } from '@/src/api/boulders'
import { resolvePublicUrl } from '@/lib/resolveUrl'

function formatDate(value?: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString()
}

function daysOnWall(setDateIso?: string | null) {
  if (!setDateIso) return null
  const start = new Date(setDateIso).getTime()
  if (Number.isNaN(start)) return null
  return Math.max(0, Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24)))
}

function colorDot(color?: string | null) {
  switch (color) {
    case 'White':
      return '#E5E7EB'
    case 'Green':
      return '#22C55E'
    case 'Blue':
      return '#3B82F6'
    case 'Red':
      return '#EF4444'
    case 'Yellow':
      return '#EAB308'
    case 'Purple':
      return '#A855F7'
    case 'Black':
      return '#111827'
    case 'Orange':
      return '#F97316'
    default:
      return '#9CA3AF'
  }
}

export default function BoulderDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const boulderId = typeof id === 'string' ? id : ''

  const { data, isLoading, isError, error } = useQuery<BoulderDetail, Error>({
    queryKey: ['boulder', boulderId],
    queryFn: () => getBoulderById(boulderId),
    enabled: !!boulderId,
  })

  if (!boulderId) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.error}>Geen boulderId gevonden.</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (isLoading) {
    return <LoadingScreen label="Boulders laden…" />
  }


  if (isError) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.error}>Kon boulder niet laden.</Text>
          <Text style={styles.mono}>{msg}</Text>
        </View>
      </SafeAreaView>
    )
  }

  const b = data
  if (!b) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text>Boulder niet gevonden.</Text>
        </View>
      </SafeAreaView>
    )
  }

  const title = b.name ?? `Boulder ${b.id.slice(0, 6)}`
  const setDate = formatDate(b.setDate)
  const onWallDays = daysOnWall(b.setDate)

  const imageUrl = resolvePublicUrl(b.imageUrl)
  const videoUrl = resolvePublicUrl(b.videoUrl)

  const setterName = b.setBy?.username ?? '—'
  const sectorName = b.sector?.name ?? '—'
  const wallName = b.sector?.wall?.name ?? '—'

  const routeColor = b.color ?? '—'
  const dot = colorDot(routeColor)

  const tags = (b.tags ?? [])
    .map(t => t.tag?.name)
    .filter((x): x is string => typeof x === 'string' && x.length > 0)

  const grade = (b.grade ?? '—').replace('FB_', '').replace('_plus', '+')

  const shareBoulder = async () => {
    try {
      const shareUrl = resolvePublicUrl(`/api/boulders/${b.id}`) ?? undefined
      const message = `Bekijk deze boulder in BoulderBuddy:\n${title}\n${shareUrl ?? ''}`

      await Share.share({
        title,
        message,
        ...(shareUrl ? { url: shareUrl } : {}),
      })
    } catch (e: unknown) {
      console.error('Share failed:', e)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{title}</Text>

        {/* eerst foto */}
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={{ color: '#777' }}>Nog geen foto</Text>
          </View>
        )}

        {/* info */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Info</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Grade</Text>
              <Text style={styles.statValue}>{grade}</Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.statLabel}>Status</Text>
              <Text style={styles.statValue}>{b.isActive ? 'Active' : 'Inactive'}</Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.statLabel}>On wall</Text>
              <Text style={styles.statValue}>{onWallDays != null ? `${onWallDays}d` : '—'}</Text>
            </View>
          </View>

          <View style={styles.colorRow}>
            <Text style={styles.colorText}>Route kleur: {routeColor}</Text>
            <View style={[styles.colorDot, { backgroundColor: dot }]} />
          </View>

          <View style={styles.divider} />

          <Row label="Setter" value={setterName} />
          <Row label="Set date" value={setDate} />

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Likes</Text>
              <Text style={styles.statValue}>❤️ {b._count.likes}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Comments</Text>
              <Text style={styles.statValue}>💬 {b._count.comments}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Logs</Text>
              <Text style={styles.statValue}>📓 {b._count.logs}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.blockTitle}>Tags</Text>
          {tags.length === 0 ? (
            <Text style={styles.muted}>Geen tags</Text>
          ) : (
            <View style={styles.tagsWrap}>
              {tags.map(tag => (
                <View key={tag} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* locatie */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Locatie</Text>
          <Row label="Wall" value={wallName} />
          <Row label="Sector" value={sectorName} />
        </View>

        {/* video als laatste */}
        {videoUrl ? (
          <View style={styles.block}>
            <Text style={styles.blockTitle}>Video</Text>
            <View style={styles.videoWrapper}>
              <Video
                source={{ uri: videoUrl }}
                style={styles.video}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping
                onPlaybackStatusUpdate={(_status: AVPlaybackStatus) => {}}
              />
            </View>
          </View>
        ) : null}
        <View style={styles.shareContainer}>
          <Pressable onPress={shareBoulder} style={styles.shareButton}>
            <Text style={styles.shareButtonText}>🔗 Deel deze boulder</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16, paddingBottom: 32, backgroundColor: '#fff' },

  title: { fontSize: 22, fontWeight: '700', marginBottom: 10, textAlign: 'center' },

  image: { width: '100%', height: 380, borderRadius: 14, backgroundColor: '#ddd', marginBottom: 12 },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee' },

  block: { borderWidth: 1, borderColor: '#eee', borderRadius: 14, padding: 14, marginTop: 12 },
  blockTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10 },

  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },

  statsRow: { flexDirection: 'row', gap: 10 },
  stat: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fafafa',
  },
  statLabel: { color: '#666', fontSize: 12 },
  statValue: { marginTop: 4, fontSize: 14, fontWeight: '800' },

  colorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  colorDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: '#e5e7eb' },
  colorText: { fontWeight: '700', color: '#111' },

  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 },
  rowLabel: { color: '#666' },
  rowValue: { fontWeight: '700', maxWidth: '60%', textAlign: 'right' },

  videoWrapper: { width: '100%', height: 260, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000' },
  video: { width: '100%', height: '100%' },

  muted: { color: '#777', fontSize: 12 },

  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: {
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fafafa',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tagChipText: { fontSize: 12, fontWeight: '800', color: '#111' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  error: { color: 'red', fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  mono: { fontFamily: 'monospace', fontSize: 12, textAlign: 'center' },

  // Share button
  shareContainer: { marginTop: 12 },
  shareButton: { borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#111827', paddingVertical: 12, borderRadius: 14, alignItems: 'center'},
  shareButtonText: { color: '#fff', fontWeight: '800', fontSize: 14 },
})
