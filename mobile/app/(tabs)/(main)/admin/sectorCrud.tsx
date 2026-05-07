import { useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View, Image} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as ImagePicker from 'expo-image-picker'

import { uploadSectorImage } from '@/src/api/uploads'
import { listWalls, type Wall } from '@/src/api/walls'
import { createSector, deleteSector, listSectors, updateSector, type Sector } from '@/src/api/sectors'

const ACCENT = '#00E5FF'
const BG = '#fff'
const CARD = '#0f172a'
const MUTED = '#64748b'
const BORDER = '#e5e7eb'
const TEXT_DARK = '#0f172a'

type Mode = 'create' | 'edit'

export default function SectorCrudScreen() {
  const qc = useQueryClient()

  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const [mode, setMode] = useState<Mode>('create')
  const [active, setActive] = useState<Sector | null>(null)

  const [name, setName] = useState('')
  const [orderText, setOrderText] = useState('')
  const [wallId, setWallId] = useState<string>('') // filter + (in modal) keuze

  // existing image (server path: /uploads/...)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)

  // picked image (local uri)
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [imageRemoved, setImageRemoved] = useState(false)

  const [pendingDelete, setPendingDelete] = useState<Sector | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const wallsQ = useQuery<Wall[], Error>({
    queryKey: ['walls'],
    queryFn: () => listWalls(),
  })

  const sectorsQ = useQuery<Sector[], Error>({
    queryKey: ['sectors'],
    queryFn: () => listSectors(),
  })

  const walls = wallsQ.data ?? []
  const sectors = sectorsQ.data ?? []

  // filter list ('' = ALL)
  const filtered = useMemo(() => {
    // helper: wallName ophalen
    const wallName = (id: string) => walls.find((w) => w.id === id)?.name ?? id

    // copy maken zodat we nooit "sectors" zelf mutaten
    const list = wallId ? sectors.filter((s) => s.wallId === wallId) : [...sectors]


    // - ALL: wallName -> order -> name
    // - 1 wall: order -> name
    list.sort((a, b) => {
      if (!wallId) {
        const byWall = wallName(a.wallId).localeCompare(wallName(b.wallId), 'nl', { sensitivity: 'base' })
        if (byWall !== 0) return byWall
      }

      const ao = typeof a.order === 'number' ? a.order : 0
      const bo = typeof b.order === 'number' ? b.order : 0
      if (ao !== bo) return ao - bo

      return (a.name ?? '').localeCompare((b.name ?? ''), 'nl', { sensitivity: 'base' })
    })

    return list
  }, [sectors, walls, wallId])


  // '' => null, invalid => 'invalid'
  const parsedOrder = useMemo(() => {
    const t = orderText.trim()
    if (t.length === 0) return null
    const n = Number(t)
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) return 'invalid' as const
    return n
  }, [orderText])

  // next order binnen gekozen muur
  const nextOrder = useMemo(() => {
    if (!wallId) return 0
    const list = sectors.filter((s) => s.wallId === wallId)
    const max = list.reduce((m, s) => (typeof s.order === 'number' ? Math.max(m, s.order) : m), -1)
    return max + 1
  }, [sectors, wallId])

  const createM = useMutation({
    mutationFn: (vars: { name: string; wallId: string; order: number; imageUrl?: string | null }) => createSector(vars),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['sectors'] })
      closeModal()
    },
    onError: (e) => setErrorMsg(e instanceof Error ? e.message : 'Create failed.'),
  })

  const updateM = useMutation({
    mutationFn: (vars: { id: string; name: string; wallId: string; order: number; imageUrl?: string | null }) => updateSector(vars),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['sectors'] })
      closeModal()
    },
    onError: (e) => setErrorMsg(e instanceof Error ? e.message : 'Update failed.'),
  })

  const deleteM = useMutation({
    mutationFn: (id: string) => deleteSector(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['sectors'] })
      setConfirmOpen(false)
      setPendingDelete(null)
      setErrorMsg(null)
    },
    onError: (e) => setErrorMsg(e instanceof Error ? e.message : 'Delete failed.'),
  })

  async function pickImage() {
    setErrorMsg(null)

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      setErrorMsg("Geen toegang tot je foto's. Geef toestemming in je instellingen.")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // ok, warning is fine
      allowsEditing: true,
      aspect: [ 3, 4],
      quality: 0.85,
    })

    if (result.canceled) return
    const uri = result.assets?.[0]?.uri ?? null
    if (!uri) return

    setImageUri(uri)
    setImageRemoved(false)
  }

  function removeImage() {
    setImageUri(null)
    // bij edit betekent remove: imageUrl -> null
    // heb ik in de backend aangepast dat het 'undefined' en 'null' kan zijn nu
    setImageRemoved(true)
  }

  function openCreate() {
    setErrorMsg(null)
    setMode('create')
    setActive(null)
    setName('')
    setOrderText('')
    setWallId('') // user moet wall kiezen
    setExistingImageUrl(null)
    setImageUri(null)
    setImageRemoved(false)
    setModalOpen(true)
  }

  function openEdit(s: Sector) {
    setErrorMsg(null)
    setMode('edit')
    setActive(s)
    setName(s.name ?? '')
    setOrderText(String(s.order ?? ''))
    setWallId(s.wallId)
    setExistingImageUrl(s.imageUrl ?? null)
    setImageUri(null)
    setImageRemoved(false)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setActive(null)
    setName('')
    setOrderText('')
    setExistingImageUrl(null)
    setImageUri(null)
    setImageRemoved(false)
    setErrorMsg(null)
  }

  function openDeleteConfirm(s: Sector) {
    setErrorMsg(null)
    setPendingDelete(s)
    setConfirmOpen(true)
  }

  const canSubmit = useMemo(() => {
    return (
      name.trim().length >= 2 &&
      !!wallId &&
      parsedOrder !== 'invalid' &&
      !(createM.isPending || updateM.isPending)
    )
  }, [name, wallId, parsedOrder, createM.isPending, updateM.isPending])

  // PREVIEW in modal:
  // 1) local picked image
  // 2) existing server image (unless removed)
  const previewUri = useMemo(() => {
    if (imageUri) return imageUri
    if (!imageRemoved && existingImageUrl) {
      const base = process.env.EXPO_PUBLIC_API_BASE_URL ?? ''
      return `${base}${existingImageUrl}`
    }
    return null
  }, [imageUri, imageRemoved, existingImageUrl])

  async function onSave() {
    setErrorMsg(null)

    const clean = name.trim()
    if (!wallId) {
      setErrorMsg('Select a wall.')
      return
    }
    if (parsedOrder === 'invalid') {
      setErrorMsg('Order must be a whole number (or leave empty).')
      return
    }

    const orderToSend = parsedOrder === null ? nextOrder : parsedOrder

    try {
      let finalImageUrl: string | null | undefined = undefined

      // user picked new image => upload => url
      if (imageUri) {
        finalImageUrl = await uploadSectorImage({ uri: imageUri })
      }

      // user removed => null
      if (imageRemoved) {
        finalImageUrl = null
      }

      if (mode === 'create') {
        createM.mutate({
          name: clean,
          wallId,
          order: orderToSend,
          imageUrl: finalImageUrl ?? null, // create: stuur null als geen image
        })
        return
      }

      if (!active) return

      updateM.mutate({
        id: active.id,
        name: clean,
        wallId,
        order: orderToSend,
        ...(finalImageUrl !== undefined ? { imageUrl: finalImageUrl } : {}), // update: enkel meegeven bij change
      })
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Upload failed.')
    }
  }

  const loading = wallsQ.isLoading || sectorsQ.isLoading
  const fatalError = wallsQ.isError || sectorsQ.isError

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.h1}>Sectors</Text>

          <Pressable style={styles.addBtn} onPress={openCreate} disabled={walls.length === 0}>
            <Ionicons name="add" size={18} color={TEXT_DARK} />
            <Text style={styles.addText}>Add</Text>
          </Pressable>
        </View>

        {/* Filters */}
        {walls.length > 0 && (
          <View style={styles.pills}>
            <Pressable onPress={() => setWallId('')} style={[styles.pill, !wallId && styles.pillActive]}>
              <Text style={[styles.pillText, !wallId && styles.pillTextActive]}>ALL</Text>
            </Pressable>

            {walls.slice(0, 3).map((w) => {
              const activePill = w.id === wallId
              return (
                <Pressable
                  key={w.id}
                  onPress={() => setWallId((prev) => (prev === w.id ? '' : w.id))}
                  style={[styles.pill, activePill && styles.pillActive]}
                >
                  <Text style={[styles.pillText, activePill && styles.pillTextActive]} numberOfLines={1}>
                    {w.name}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        )}

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
              const thumbUri = item.imageUrl ? `${process.env.EXPO_PUBLIC_API_BASE_URL ?? ''}${item.imageUrl}` : null

              return (
                <Pressable style={({ pressed }) => [styles.row, pressed && { opacity: 0.9 }]} onPress={() => openEdit(item)}>
                  {thumbUri ? (
                    <Image source={{ uri: thumbUri }} style={styles.thumb} />
                  ) : (
                    <View style={styles.thumbPlaceholder}>
                      <Ionicons name="image-outline" size={18} color={MUTED} />
                    </View>
                  )}

                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{item.name}</Text>
                    <Text style={styles.rowSub}>
                      order: {item.order} • wall:{' '}
                      {walls.find((w) => w.id === item.wallId)?.name ?? item.wallId.slice(0, 8)}
                    </Text>
                  </View>

                  <Pressable onPress={() => openDeleteConfirm(item)} hitSlop={10} style={styles.kebab}>
                    <Ionicons name="trash-outline" size={18} color={MUTED} />
                  </Pressable>
                </Pressable>
              )
            }}
            refreshing={sectorsQ.isRefetching}
            onRefresh={() => void sectorsQ.refetch()}
          />
        )}

        {/* Create/Edit Modal */}
        <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={closeModal}>
          <View style={styles.overlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{mode === 'create' ? 'Create sector' : 'Edit sector'}</Text>
                <Pressable onPress={closeModal} hitSlop={10}>
                  <Ionicons name="close" size={20} color={MUTED} />
                </Pressable>
              </View>

              <Text style={styles.label}>Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Left side"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                autoCapitalize="words"
              />

              <Text style={styles.label}>Wall</Text>
              {walls.length === 0 ? (
                <Text style={styles.helper}>Loading walls…</Text>
              ) : (
                <View style={styles.wallPickWrap}>
                  {walls.map((w) => {
                    const isActive = w.id === wallId
                    return (
                      <Pressable
                        key={w.id}
                        onPress={() => setWallId(w.id)}
                        style={[styles.wallPick, isActive && styles.wallPickActive]}
                      >
                        <Text style={[styles.wallPickText, isActive && styles.wallPickTextActive]} numberOfLines={1}>
                          {w.name}
                        </Text>
                      </Pressable>
                    )
                  })}
                </View>
              )}

              <Text style={styles.label}>Order (optional)</Text>
              <TextInput
                value={orderText}
                onChangeText={setOrderText}
                placeholder={`leave empty => ${nextOrder}`}
                placeholderTextColor="#94a3b8"
                style={styles.input}
                keyboardType="number-pad"
              />

              <Text style={styles.label}>Photo (optional)</Text>
              <View style={styles.imageRow}>
                <Pressable style={styles.imageBtn} onPress={() => void pickImage()}>
                  <Ionicons name="image-outline" size={18} color={TEXT_DARK} />
                  <Text style={styles.imageBtnText}>Choose photo</Text>
                </Pressable>

                {(imageUri || existingImageUrl) && (
                  <Pressable style={styles.imageBtnOutline} onPress={removeImage}>
                    <Ionicons name="close" size={18} color={TEXT_DARK} />
                    <Text style={styles.imageBtnText}>Remove</Text>
                  </Pressable>
                )}
              </View>

              {previewUri && <Image source={{ uri: previewUri }} style={styles.preview} resizeMode="cover" />}

              {errorMsg ? <Text style={styles.err}>{errorMsg}</Text> : null}

              <View style={styles.modalActions}>
                <Pressable style={styles.outlineBtn} onPress={closeModal}>
                  <Text style={styles.outlineText}>Cancel</Text>
                </Pressable>

                <Pressable style={[styles.primaryBtn, !canSubmit && { opacity: 0.5 }]} onPress={onSave} disabled={!canSubmit}>
                  {createM.isPending || updateM.isPending ? (
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
              <Text style={styles.modalTitle}>Delete sector?</Text>
              <Text style={styles.muted}>{pendingDelete ? `"${pendingDelete.name}" will be deleted.` : ''}</Text>

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

  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },

  pill: {
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#fff',
    maxWidth: 160,
  },
  pillActive: { borderColor: ACCENT },
  pillText: { color: MUTED, fontWeight: '800' },
  pillTextActive: { color: ACCENT },

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
  rowTitle: { color: ACCENT, fontWeight: '900', fontSize: 16 },
  rowSub: { color: '#94A3B8', fontSize: 12, marginTop: 4 },

  thumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#111827',
  },
  thumbPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#0b1220',
    alignItems: 'center',
    justifyContent: 'center',
  },

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
  helper: { color: MUTED, marginTop: 8, fontSize: 12 },

  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: TEXT_DARK,
  },

  modalActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end', marginTop: 14 },

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

  wallPickWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  wallPick: {
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#fff',
    maxWidth: 220,
  },
  wallPickActive: { borderColor: ACCENT },
  wallPickText: { color: MUTED, fontWeight: '800' },
  wallPickTextActive: { color: ACCENT },

  imageRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  imageBtn: {
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
  imageBtnOutline: {
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
  imageBtnText: { color: TEXT_DARK, fontWeight: '900' },

  preview: {
    marginTop: 10,
    width: '100%',
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#f3f4f6',
  },
})
