import { useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, LayoutAnimation, Modal, Platform, Pressable, ScrollView, StyleSheet,
  Text, TextInput, UIManager, View, Switch, Image} from 'react-native'

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as ImagePicker from 'expo-image-picker'
import { Colors} from '@/src/components/color'
import { listWalls, type Wall } from '@/src/api/walls'
import { listSectors, type Sector } from '@/src/api/sectors'
import { createBoulder, deleteBoulder, listBoulders, updateBoulder, type BoulderDetail, type CreateBoulderInput,
  type UpdateBoulderInput} from '@/src/api/boulders'

import { listBoulderGrades } from '@/src/api/boulderGrade'
import { uploadBoulderImage, uploadBoulderVideo } from '@/src/api/uploads'

const ACCENT = Colors.accent
const BG = Colors.background
const CARD = Colors.card
const MUTED = Colors.text.muted
const BORDER = Colors.border
const TEXT_DARK = Colors.text.dark
const TEXT_LIGHT = Colors.text.light

type ActiveFilter = 'all' | 'active' | 'inactive'
type Mode = 'create' | 'edit'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

function colorDot(color: string) {
  const c = (color ?? '').toLowerCase()
  if (c.includes('red')) return '#ef4444'
  if (c.includes('blue')) return '#3b82f6'
  if (c.includes('green')) return '#22c55e'
  if (c.includes('yellow')) return '#eab308'
  if (c.includes('black')) return '#111827'
  if (c.includes('white')) return '#e5e7eb'
  if (c.includes('purple')) return '#a855f7'
  if (c.includes('orange')) return '#f97316'
  if (c.includes('pink')) return '#ec4899'
  return ACCENT
}

// grade: FB_6A_PLUS -> 6A+
function formatFbGrade(db: string) {
  const s = (db ?? '').replace(/^FB_/, '')
  const withPlus = s.replace(/_PLUS$/, '+')
  return withPlus.replaceAll('_', '')
}

const FALLBACK_COLORS = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'BLACK', 'WHITE', 'PURPLE', 'ORANGE', 'PINK']

function basename(uri: string) {
  return uri.split('/').pop() ?? uri
}

function resolveUrl(maybeUrl: string | null) {
  if (!maybeUrl) return null
  if (maybeUrl.startsWith('http://') || maybeUrl.startsWith('https://')) return maybeUrl
  const base = process.env.EXPO_PUBLIC_API_BASE_URL ?? ''
  if (!base) return maybeUrl // fallback: laat relative staan
  return `${base}${maybeUrl.startsWith('/') ? '' : '/'}${maybeUrl}`
}

export default function BouldersCrudScreen() {
  const qc = useQueryClient()
  const insets = useSafeAreaInsets()

  // filters
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [wallId, setWallId] = useState<string>('')
  const [sectorId, setSectorId] = useState<string>('')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all')

  // modal
  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('create')
  const [active, setActive] = useState<BoulderDetail | null>(null)

  // form
  const [name, setName] = useState('')
  const [formWallId, setFormWallId] = useState<string>('')
  const [formSectorId, setFormSectorId] = useState<string>('')
  const [color, setColor] = useState<string>('RED')
  const [grade, setGrade] = useState<string>('')
  const [isActive, setIsActive] = useState(true)

  // media: existing server urls
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null)

  // media: picked local uris
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [videoUri, setVideoUri] = useState<string | null>(null)

  // remove flags
  const [imageRemoved, setImageRemoved] = useState(false)
  const [videoRemoved, setVideoRemoved] = useState(false)

  // delete confirm
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<BoulderDetail | null>(null)

  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const wallsQ = useQuery<Wall[], Error>({ queryKey: ['walls'], queryFn: () => listWalls() })
  const sectorsQ = useQuery<Sector[], Error>({ queryKey: ['sectors'], queryFn: () => listSectors() })
  const bouldersQ = useQuery<BoulderDetail[], Error>({ queryKey: ['boulders'], queryFn: () => listBoulders() })
  const gradesQ = useQuery<string[], Error>({ queryKey: ['boulderGrades'], queryFn: () => listBoulderGrades() })

  const walls = wallsQ.data ?? []
  const sectors = sectorsQ.data ?? []
  const boulders = bouldersQ.data ?? []
  const gradeOptionsRaw = gradesQ.data ?? []

  const gradeOptions = useMemo(() => {
    const raw = Array.isArray(gradeOptionsRaw) ? gradeOptionsRaw : []
    const arr = [...new Set(raw.filter((x) => typeof x === 'string' && x.length > 0))]
    return arr.sort((a, b) => formatFbGrade(a).localeCompare(formatFbGrade(b)))
  }, [gradeOptionsRaw])

  const sectorsForWallFilter = useMemo(() => {
    if (!wallId) return sectors
    return sectors.filter((s) => s.wallId === wallId)
  }, [sectors, wallId])

  const colorOptions = useMemo(() => {
    const set = new Set<string>()
    for (const b of boulders) if (b.color) set.add(b.color)
    const arr = [...set]
    return arr.length ? arr.sort() : FALLBACK_COLORS
  }, [boulders])

  const filtered = useMemo(() => {
    let list = boulders

    if (wallId) list = list.filter((b) => (b.sector?.wall?.id ?? b.sector?.wallId) === wallId)
    if (sectorId) list = list.filter((b) => b.sector?.id === sectorId)

    if (activeFilter === 'active') list = list.filter((b) => b.isActive)
    if (activeFilter === 'inactive') list = list.filter((b) => !b.isActive)

    const wallName = (b: BoulderDetail) => b.sector?.wall?.name ?? ''
    const sectorName = (b: BoulderDetail) => b.sector?.name ?? ''
    return [...list].sort((a, b) => {
      const w = wallName(a).localeCompare(wallName(b))
      if (w !== 0) return w

      const s = sectorName(a).localeCompare(sectorName(b))
      return s
    })

  }, [boulders, wallId, sectorId, activeFilter])

  const sectorsForFormWall = useMemo(() => {
    if (!formWallId) return []
    return sectors.filter((s) => s.wallId === formWallId)
  }, [sectors, formWallId])

  const createM = useMutation({
    mutationFn: (vars: CreateBoulderInput) => createBoulder(vars),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['boulders'] })
      closeModal()
    },
    onError: (e) => setErrorMsg(e instanceof Error ? e.message : 'Create failed.'),
  })

  const updateM = useMutation({
    mutationFn: (vars: UpdateBoulderInput) => updateBoulder(vars),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['boulders'] })
      closeModal()
    },
    onError: (e) => setErrorMsg(e instanceof Error ? e.message : 'Update failed.'),
  })

  const deleteM = useMutation({
    mutationFn: (id: string) => deleteBoulder(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['boulders'] })
      setConfirmOpen(false)
      setPendingDelete(null)
      setErrorMsg(null)
    },
    onError: (e) => setErrorMsg(e instanceof Error ? e.message : 'Delete failed.'),
  })

  function openDeleteConfirm(b: BoulderDetail) {
    setErrorMsg(null)
    setPendingDelete(b)
    setConfirmOpen(true)
  }

  async function ensureMediaPermission() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) throw new Error("Geen toegang tot je foto's. Geef toestemming in je instellingen.")
  }

  async function pickImage() {
    try {
      setErrorMsg(null)
      await ensureMediaPermission()

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      })

      if (result.canceled) return
      const uri = result.assets?.[0]?.uri ?? null
      if (!uri) return

      setImageUri(uri)
      setImageRemoved(false)
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Image picker failed.')
    }
  }

  async function pickVideo() {
    try {
      setErrorMsg(null)
      await ensureMediaPermission()

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      })

      if (result.canceled) return
      const uri = result.assets?.[0]?.uri ?? null
      if (!uri) return

      setVideoUri(uri)
      setVideoRemoved(false)
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Video picker failed.')
    }
  }

  function removeImage() {
    setImageUri(null)
    setImageRemoved(true)
  }

  function removeVideo() {
    setVideoUri(null)
    setVideoRemoved(true)
  }

  function openCreate() {
    setErrorMsg(null)
    setMode('create')
    setActive(null)
    setName('')
    setIsActive(true)

    const defaultWall = walls[0]?.id ?? ''
    setFormWallId(defaultWall)

    const firstSector = defaultWall ? sectors.find((s) => s.wallId === defaultWall) : undefined
    setFormSectorId(firstSector?.id ?? '')

    setColor(colorOptions[0] ?? 'RED')
    setGrade(gradeOptions[0] ?? '')

    setExistingImageUrl(null)
    setExistingVideoUrl(null)
    setImageUri(null)
    setVideoUri(null)
    setImageRemoved(false)
    setVideoRemoved(false)

    setModalOpen(true)
  }

  function openEdit(b: BoulderDetail) {
    setErrorMsg(null)
    setMode('edit')
    setActive(b)
    setName(b.name ?? '')
    setIsActive(!!b.isActive)

    const wId = b.sector?.wall?.id ?? b.sector?.wallId ?? ''
    setFormWallId(wId)
    setFormSectorId(b.sector?.id ?? '')

    setColor(b.color ?? (colorOptions[0] ?? 'RED'))
    setGrade(b.grade ?? (gradeOptions[0] ?? ''))

    setExistingImageUrl(b.imageUrl ?? null)
    setExistingVideoUrl(b.videoUrl ?? null)

    setImageUri(null)
    setVideoUri(null)
    setImageRemoved(false)
    setVideoRemoved(false)

    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setActive(null)
    setErrorMsg(null)
    setUploading(false)
  }

  const canSubmit = useMemo(() => {
    if (!formWallId) return false
    if (!formSectorId) return false
    if (!color) return false
    if (!grade) return false
    if (uploading) return false
    if (createM.isPending || updateM.isPending) return false
    return true
  }, [formWallId, formSectorId, color, grade, uploading, createM.isPending, updateM.isPending])

  function onToggleFilters() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setFiltersOpen((v) => !v)
  }

  const previewImageUri = useMemo(() => {
    if (imageUri) return imageUri
    if (!imageRemoved && existingImageUrl) return resolveUrl(existingImageUrl)
    return null
  }, [imageUri, imageRemoved, existingImageUrl])

  const videoLabel = useMemo(() => {
    if (videoUri) return basename(videoUri)
    if (!videoRemoved && existingVideoUrl) return basename(existingVideoUrl)
    return null
  }, [videoUri, videoRemoved, existingVideoUrl])

  async function onSave() {
    setErrorMsg(null)

    if (!formSectorId) return setErrorMsg('Select a sector.')
    if (!grade) return setErrorMsg('Select a grade.')
    if (!color) return setErrorMsg('Select a color.')

    try {
      setUploading(true)

      let finalImageUrl: string | null | undefined = undefined
      let finalVideoUrl: string | null | undefined = undefined

      // image: upload of verwijderen
      if (imageUri) finalImageUrl = await uploadBoulderImage({ uri: imageUri })
      if (imageRemoved) finalImageUrl = null

      // video: upload of verwijderen
      if (videoUri) finalVideoUrl = await uploadBoulderVideo({ uri: videoUri })
      if (videoRemoved) finalVideoUrl = null

      const basePayload = {
        name: name.trim() ? name.trim() : null,
        color,
        grade,
        sectorId: formSectorId,
        isActive,
      } satisfies Pick<CreateBoulderInput, 'name' | 'color' | 'grade' | 'sectorId' | 'isActive'>

      if (mode === 'create') {
        const payload: CreateBoulderInput = {
          ...basePayload,
          ...(finalImageUrl !== undefined ? { imageUrl: finalImageUrl } : {}),
          ...(finalVideoUrl !== undefined ? { videoUrl: finalVideoUrl } : {}),
        }
        createM.mutate(payload)
        return
      }

      if (!active) return

      const payload: UpdateBoulderInput = {
        id: active.id,
        ...basePayload,
        ...(finalImageUrl !== undefined ? { imageUrl: finalImageUrl } : {}),
        ...(finalVideoUrl !== undefined ? { videoUrl: finalVideoUrl } : {}),
      }

      updateM.mutate(payload)
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const loading = wallsQ.isLoading || sectorsQ.isLoading || bouldersQ.isLoading
  const fatalError = wallsQ.isError || sectorsQ.isError || bouldersQ.isError

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.h1}>Boulders</Text>

          <Pressable style={styles.addBtn} onPress={openCreate} disabled={walls.length === 0 || sectors.length === 0}>
            <Ionicons name="add" size={18} color={TEXT_DARK} />
            <Text style={styles.addText}>Add</Text>
          </Pressable>
        </View>

        {/* Filters */}
        <View style={styles.filtersWrap}>
          <View style={styles.filterHeaderRow}>
            <Text style={styles.filterTitle}>Wall filter:</Text>

            <Pressable onPress={onToggleFilters} hitSlop={10} style={styles.collapseBtn}>
              <Ionicons name={filtersOpen ? 'chevron-up' : 'chevron-down'} size={18} color={MUTED} />
            </Pressable>
          </View>

          {filtersOpen && (
            <>
              <View style={styles.pills}>
                <Pressable
                  onPress={() => {
                    setWallId('')
                    setSectorId('')
                  }}
                  style={[styles.pill, !wallId && styles.pillActive]}
                >
                  <Text style={[styles.pillText, !wallId && styles.pillTextActive]}>ALL</Text>
                </Pressable>

                {walls.slice(0, 3).map((w) => {
                  const activePill = w.id === wallId
                  return (
                    <Pressable
                      key={w.id}
                      onPress={() => {
                        setWallId((prev) => (prev === w.id ? '' : w.id))
                        setSectorId('')
                      }}
                      style={[styles.pill, activePill && styles.pillActive]}
                    >
                      <Text style={[styles.pillText, activePill && styles.pillTextActive]} numberOfLines={1}>
                        {w.name}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>

              <Text style={[styles.filterTitle, { marginTop: 12 }]}>Sector filter:</Text>
              <View style={styles.pills}>
                <Pressable onPress={() => setSectorId('')} style={[styles.pill, !sectorId && styles.pillActive]}>
                  <Text style={[styles.pillText, !sectorId && styles.pillTextActive]}>ALL</Text>
                </Pressable>

                {sectorsForWallFilter.slice(0, 6).map((s) => {
                  const activePill = s.id === sectorId
                  return (
                    <Pressable
                      key={s.id}
                      onPress={() => setSectorId((prev) => (prev === s.id ? '' : s.id))}
                      style={[styles.pill, activePill && styles.pillActive]}
                    >
                      <Text style={[styles.pillText, activePill && styles.pillTextActive]} numberOfLines={1}>
                        {s.name}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>

              <Text style={[styles.filterTitle, { marginTop: 12 }]}>Active filter:</Text>
              <View style={[styles.pills, { marginTop: 10 }]}>
                {(['all', 'active', 'inactive'] as const).map((k) => {
                  const activePill = activeFilter === k
                  return (
                    <Pressable key={k} onPress={() => setActiveFilter(k)} style={[styles.pillSmall, activePill && styles.pillActive]}>
                      <Text style={[styles.pillText, activePill && styles.pillTextActive]}>
                        {k === 'all' ? 'ALL' : k.toUpperCase()}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </>
          )}
        </View>

        {loading && (
          <View style={styles.center}>
            <ActivityIndicator />
            <Text style={styles.muted}>Loading…</Text>
          </View>
        )}

        {fatalError && (
          <View style={styles.center}>
            <Text style={styles.err}>Failed to load data.</Text>
            <Pressable
              style={styles.outlineBtn}
              onPress={() => {
                void wallsQ.refetch()
                void sectorsQ.refetch()
                void bouldersQ.refetch()
                void gradesQ.refetch()
              }}
            >
              <Text style={styles.outlineText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {!loading && !fatalError && (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 0 }}
            style={{ flex: 1, backgroundColor: BG }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => {
              const wallName = item.sector?.wall?.name ?? '—'
              const sectorName = item.sector?.name ?? '—'
              const gradeLabel = item.grade ? formatFbGrade(item.grade) : '—'
              const hasMedia = !!item.imageUrl || !!item.videoUrl

              return (
                <Pressable style={({ pressed }) => [styles.row, pressed && { opacity: 0.9 }]} onPress={() => openEdit(item)}>
                  <View style={[styles.dot, { backgroundColor: colorDot(item.color ?? '') }]} />

                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {item.name?.trim() ? item.name : '(no name)'} • {gradeLabel}
                    </Text>

                    <Text style={styles.rowSub} numberOfLines={1}>
                      {wallName} / {sectorName} • {item.isActive ? 'active' : 'inactive'}
                      {hasMedia ? ' • media' : ''}
                    </Text>
                  </View>

                  <Pressable onPress={() => openDeleteConfirm(item)} hitSlop={10} style={styles.kebab}>
                    <Ionicons name="trash-outline" size={18} color={MUTED} />
                  </Pressable>
                </Pressable>
              )
            }}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.muted}>No boulders found.</Text>
              </View>
            }
            refreshing={bouldersQ.isRefetching}
            onRefresh={() => void bouldersQ.refetch()}
          />
        )}

        {/* Create/Edit Modal */}
        <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={closeModal}>
          <View style={[styles.overlay, { paddingBottom: 18 + insets.bottom }]}>
            <View style={[styles.modalCard, { maxHeight: '90%' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{mode === 'create' ? 'Create boulder' : 'Edit boulder'}</Text>
                <Pressable onPress={closeModal} hitSlop={10}>
                  <Ionicons name="close" size={20} color={MUTED} />
                </Pressable>
              </View>

              <ScrollView
                style={{ maxHeight: '78%' }}
                contentContainerStyle={{ paddingBottom: 14 }}
                showsVerticalScrollIndicator
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.label}>Name (optional)</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Slab dyno"
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                  autoCapitalize="words"
                />

                <Text style={styles.label}>Wall</Text>
                <View style={styles.pills}>
                  {walls.map((w) => {
                    const activePill = w.id === formWallId
                    return (
                      <Pressable
                        key={w.id}
                        onPress={() => {
                          setFormWallId(w.id)
                          const first = sectors.find((s) => s.wallId === w.id)
                          setFormSectorId(first?.id ?? '')
                        }}
                        style={[styles.pill, activePill && styles.pillActive]}
                      >
                        <Text style={[styles.pillText, activePill && styles.pillTextActive]} numberOfLines={1}>
                          {w.name}
                        </Text>
                      </Pressable>
                    )
                  })}
                </View>

                <Text style={styles.label}>Sector</Text>
                <View style={styles.pills}>
                  {sectorsForFormWall.length === 0 ? (
                    <Text style={styles.muted}>No sectors for this wall.</Text>
                  ) : (
                    sectorsForFormWall.map((s) => {
                      const activePill = s.id === formSectorId
                      return (
                        <Pressable key={s.id} onPress={() => setFormSectorId(s.id)} style={[styles.pill, activePill && styles.pillActive]}>
                          <Text style={[styles.pillText, activePill && styles.pillTextActive]} numberOfLines={1}>
                            {s.name}
                          </Text>
                        </Pressable>
                      )
                    })
                  )}
                </View>

                <Text style={styles.label}>Grade</Text>
                <View style={styles.gradePickerWrap}>
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator
                    data={gradeOptions}
                    keyExtractor={(g) => g}
                    ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
                    renderItem={({ item }) => {
                      const activeChip = item === grade
                      return (
                        <Pressable onPress={() => setGrade(item)} style={[styles.gradeChip, activeChip && styles.gradeChipActive]}>
                          <Text style={[styles.gradeChipText, activeChip && styles.gradeChipTextActive]}>{formatFbGrade(item)}</Text>
                        </Pressable>
                      )
                    }}
                  />
                </View>

                <Text style={styles.label}>Color</Text>
                <View style={styles.gradePickerWrap}>
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator
                    data={colorOptions}
                    keyExtractor={(c) => c}
                    ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
                    renderItem={({ item }) => {
                      const activeChip = item === color
                      return (
                        <Pressable onPress={() => setColor(item)} style={[styles.colorChip, activeChip && styles.gradeChipActive]}>
                          <View style={[styles.dot, { backgroundColor: colorDot(item) }]} />
                          <Text style={[styles.gradeChipText, activeChip && styles.gradeChipTextActive]}>{item}</Text>
                        </Pressable>
                      )
                    }}
                  />
                </View>

                <Text style={styles.label}>Active</Text>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>{isActive ? 'ACTIVE' : 'INACTIVE'}</Text>
                  <Switch
                    value={isActive}
                    onValueChange={setIsActive}
                    trackColor={{ false: BORDER, true: ACCENT }}
                    thumbColor={BG}
                    style={{ transform: [{ scaleX: 1.15 }, { scaleY: 1.15 }] }}
                  />
                </View>

                {/* IMAGE */}
                <Text style={styles.label}>Photo (optional)</Text>
                <View style={styles.mediaRow}>
                  <Pressable style={styles.mediaBtn} onPress={() => void pickImage()}>
                    <Ionicons name="image-outline" size={18} color={TEXT_DARK} />
                    <Text style={styles.mediaBtnText}>Choose photo</Text>
                  </Pressable>

                  {(imageUri || (!imageRemoved && existingImageUrl)) && (
                    <Pressable style={styles.mediaBtnOutline} onPress={removeImage}>
                      <Ionicons name="close" size={18} color={TEXT_DARK} />
                      <Text style={styles.mediaBtnText}>Remove</Text>
                    </Pressable>
                  )}
                </View>

                {previewImageUri ? <Image source={{ uri: previewImageUri }} style={styles.preview} resizeMode="cover" /> : null}

                {/* VIDEO */}
                <Text style={styles.label}>Video (optional)</Text>
                <View style={styles.mediaRow}>
                  <Pressable style={styles.mediaBtn} onPress={() => void pickVideo()}>
                    <Ionicons name="videocam-outline" size={18} color={TEXT_DARK} />
                    <Text style={styles.mediaBtnText}>Choose video</Text>
                  </Pressable>

                  {(videoUri || (!videoRemoved && existingVideoUrl)) && (
                    <Pressable style={styles.mediaBtnOutline} onPress={removeVideo}>
                      <Ionicons name="close" size={18} color={TEXT_DARK} />
                      <Text style={styles.mediaBtnText}>Remove</Text>
                    </Pressable>
                  )}
                </View>

                {videoLabel ? (
                  <View style={styles.videoBadge}>
                    <Ionicons name="videocam" size={16} color={MUTED} />
                    <Text style={styles.videoBadgeText} numberOfLines={1}>
                      {videoUri ? `selected: ${basename(videoUri)}` : `current: ${videoLabel}`}
                    </Text>
                  </View>
                ) : null}

                {errorMsg ? <Text style={styles.err}>{errorMsg}</Text> : null}
              </ScrollView>

              <View style={styles.modalActions}>
                <Pressable style={styles.outlineBtn} onPress={closeModal} disabled={uploading || createM.isPending || updateM.isPending}>
                  <Text style={styles.outlineText}>Cancel</Text>
                </Pressable>

                <Pressable style={[styles.primaryBtn, !canSubmit && { opacity: 0.5 }]} onPress={() => void onSave()} disabled={!canSubmit}>
                  {uploading || createM.isPending || updateM.isPending ? (
                    <ActivityIndicator />
                  ) : (
                    <Text style={styles.primaryText}>{mode === 'create' ? 'Create' : 'Save'}</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Delete confirm modal */}
        <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={() => setConfirmOpen(false)}>
          <View style={styles.overlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Delete boulder?</Text>
              <Text style={styles.muted}>{pendingDelete ? `"${pendingDelete.name ?? '(no name)'}" will be deleted.` : ''}</Text>

              {errorMsg ? <Text style={styles.err}>{errorMsg}</Text> : null}

              <View style={styles.modalActions}>
                <Pressable
                  style={styles.outlineBtn}
                  onPress={() => {
                    setConfirmOpen(false)
                    setPendingDelete(null)
                    setErrorMsg(null)
                  }}
                  disabled={deleteM.isPending}
                >
                  <Text style={styles.outlineText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={[styles.dangerBtn, deleteM.isPending && { opacity: 0.6 }]}
                  onPress={() => pendingDelete && deleteM.mutate(pendingDelete.id)}
                  disabled={!pendingDelete || deleteM.isPending}
                >
                  {deleteM.isPending ? <ActivityIndicator /> : <Text style={styles.dangerText}>Delete</Text>}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  screen: { flex: 1, backgroundColor: BG, paddingHorizontal: 14, paddingTop: 14 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6 },
  h1: { fontSize: 22, fontWeight: '900', color: TEXT_DARK },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ACCENT,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addText: { fontWeight: '900', color: TEXT_DARK },

  filtersWrap: { marginTop: 14 },
  filterTitle: { color: MUTED, fontSize: 12, fontWeight: '900' },
  filterHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  collapseBtn: { paddingLeft: 10, paddingVertical: 6 },

  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  pill: {
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#fff',
    maxWidth: 170,
  },
  pillSmall: {
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#fff',
    maxWidth: 170,
  },
  pillActive: { borderColor: ACCENT },
  pillText: { color: MUTED, fontWeight: '800' },
  pillTextActive: { color: ACCENT },

  center: { paddingTop: 30, alignItems: 'center', gap: 10 },
  muted: { color: MUTED },

  row: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowTitle: { color: TEXT_LIGHT, fontWeight: '900', fontSize: 15 },
  rowSub: { color: '#94A3B8', fontSize: 12, marginTop: 4 },

  dot: { width: 12, height: 12, borderRadius: 999, borderWidth: 1, borderColor: '#0b1220' },

  kebab: { paddingLeft: 10, paddingVertical: 6 },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { color: TEXT_DARK, fontWeight: '900', fontSize: 16 },

  label: { color: MUTED, marginTop: 10, marginBottom: 6, fontWeight: '800' },

  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: TEXT_DARK,
  },

  gradePickerWrap: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  gradeChip: {
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#fff',
  },
  colorChip: {
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gradeChipActive: { borderColor: ACCENT },
  gradeChipText: { color: MUTED, fontWeight: '900' },
  gradeChipTextActive: { color: ACCENT },

  modalActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end', marginTop: 14, paddingTop: 10 },

  outlineBtn: {
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  outlineText: { color: TEXT_DARK, fontWeight: '900' },

  primaryBtn: {
    backgroundColor: ACCENT,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 110,
    alignItems: 'center',
  },
  primaryText: { color: TEXT_DARK, fontWeight: '900' },

  dangerBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 110,
    alignItems: 'center',
  },
  dangerText: { color: '#fff', fontWeight: '900' },

  err: { color: '#DC2626', marginTop: 10, fontWeight: '800' },

  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 6 },
  switchLabel: { color: MUTED, fontWeight: '800' },

  mediaRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  mediaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  mediaBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  mediaBtnText: { color: TEXT_DARK, fontWeight: '900' },

  preview: {
    marginTop: 10,
    width: '100%',
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#f3f4f6',
  },

  videoBadge: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  videoBadgeText: { color: MUTED, fontWeight: '800', flex: 1 },
})
