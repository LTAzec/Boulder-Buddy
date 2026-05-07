import { useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View} from 'react-native'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { listGyms } from '@/src/api/gyms'
import { createWall, deleteWall, listWalls, updateWall, type Wall} from '@/src/api/walls'
import { SafeAreaView } from 'react-native-safe-area-context'

const ACCENT = '#00E5FF'
const BG = '#FF'
const CARD = '#111827'
const MUTED = '#94A3B8'
const TEXT = '#0f172a'
const BORDER = '#e5e7eb'

type Mode = 'create' | 'edit'

export default function WallCrudScreen() {
  const qc = useQueryClient()

  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const [mode, setMode] = useState<Mode>('create')
  const [active, setActive] = useState<Wall | null>(null)

  const [name, setName] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Wall | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const gymsQ = useQuery({
    queryKey: ['gyms'],
    queryFn: listGyms,
  })

  const gymId = gymsQ.data?.[0]?.id ?? null

  const wallsQ = useQuery({
    queryKey: ['walls', gymId],
    queryFn: () => listWalls(gymId ?? undefined),
    enabled: !!gymId,
  })

  const createM = useMutation({
    mutationFn: (vars: { name: string; gymId: string }) => createWall(vars),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['walls'] })
      closeModal()
    },
    onError: () => setErrorMsg('Create failed. Check name & connection.'),
  })

  const updateM = useMutation({
    mutationFn: (vars: { id: string; name: string; gymId: string }) => updateWall(vars),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['walls'] })
      closeModal()
    },
    onError: () => setErrorMsg('Update failed.'),
  })

  const deleteM = useMutation({
    mutationFn: (id: string) => deleteWall(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['walls'] })
      setConfirmOpen(false)
      setPendingDelete(null)
    },
    onError: () => setErrorMsg('Delete failed.'),
  })

  function openCreate() {
    setErrorMsg(null)
    setMode('create')
    setActive(null)
    setName('')
    setModalOpen(true)
  }

  function openEdit(w: Wall) {
    setErrorMsg(null)
    setMode('edit')
    setActive(w)
    setName(w.name ?? '')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setActive(null)
    setName('')
    setErrorMsg(null)
  }

  function openDeleteConfirm(w: Wall) {
    setErrorMsg(null)
    setPendingDelete(w)
    setConfirmOpen(true)
  }

  const canSubmit = useMemo(() => {
    return name.trim().length >= 2 && !!gymId && !(createM.isPending || updateM.isPending)
  }, [name, gymId, createM.isPending, updateM.isPending])

  function onSave() {
    if (!gymId) return
    const clean = name.trim()

    if (mode === 'create') {
      createM.mutate({ name: clean, gymId })
      return
    }

    if (!active) return
    updateM.mutate({ id: active.id, name: clean, gymId })
  }

  const loading = gymsQ.isLoading || wallsQ.isLoading
  const fatalError = gymsQ.isError || wallsQ.isError

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.h1}>Walls</Text>

        <Pressable style={styles.addBtn} onPress={openCreate} disabled={!gymId}>
          <Ionicons name="add" size={18} color={BG} />
          <Text style={styles.addText}>Add</Text>
        </Pressable>
      </View>

      <Text style={styles.sub}>
        {gymId ? `Gym: ${gymsQ.data?.[0]?.name ?? 'Gustaaf'}` : 'Loading gym…'}
      </Text>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Loading…</Text>
        </View>
      )}

      {fatalError && (
        <View style={styles.center}>
          <Text style={styles.err}>Failed to load data.</Text>
          <Pressable style={styles.outlineBtn} onPress={() => {
            void gymsQ.refetch()
            void wallsQ.refetch()
          }}>
            <Text style={styles.outlineText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {!loading && !fatalError && (
        <FlatList
          data={wallsQ.data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 12 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.9 }]}
              onPress={() => openEdit(item)}          // tap = edit (simpel)
              onLongPress={() => openEdit(item)}      // long press = edit (gesture punten ✅)
              delayLongPress={250}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{item.name}</Text>
                <Text style={styles.rowSub}>ID: {item.id.slice(0, 8)}…</Text>
              </View>

              <Pressable
                onPress={() => openDeleteConfirm(item)}
                hitSlop={10}
                style={styles.kebab}
              >
                <Ionicons name="ellipsis-vertical" size={18} color={MUTED} />
              </Pressable>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.muted}>No walls yet.</Text>
            </View>
          }
          refreshing={wallsQ.isRefetching}
          onRefresh={() => wallsQ.refetch()}
        />
      )}

      {/* Create/Edit Modal */}
      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{mode === 'create' ? 'Create wall' : 'Edit wall'}</Text>
              <Pressable onPress={closeModal} hitSlop={10}>
                <Ionicons name="close" size={20} color={MUTED} />
              </Pressable>
            </View>

            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Main Wall"
              placeholderTextColor="#6B7280"
              style={styles.input}
              autoCapitalize="words"
            />

            {errorMsg ? <Text style={styles.err}>{errorMsg}</Text> : null}

            <View style={styles.modalActions}>
              <Pressable style={styles.outlineBtn} onPress={closeModal}>
                <Text style={styles.outlineText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.primaryBtn, !canSubmit && { opacity: 0.5 }]}
                onPress={onSave}
                disabled={!canSubmit}
              >
                {(createM.isPending || updateM.isPending) ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={styles.primaryText}>{mode === 'create' ? 'Create' : 'Save'}</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete confirm modal (no Alert) */}
      <Modal
        visible={confirmOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmOpen(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete wall?</Text>
            <Text style={styles.muted}>
              {pendingDelete ? `"${pendingDelete.name}" will be deleted.` : ''}
              {'\n'}Sectors under this wall may also be removed.
            </Text>

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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG, paddingHorizontal: 16, paddingTop: 8 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
  },
  h1: { fontSize: 22, fontWeight: '900', color: TEXT },

  sub: { marginTop: 6, color: MUTED, fontSize: 12 },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ACCENT,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addText: { fontWeight: '900', color: '#001018' },

  center: { paddingTop: 30, alignItems: 'center', gap: 10 },
  muted: { color: MUTED },

  row: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  rowTitle: { color: ACCENT, fontWeight: '900', fontSize: 16 },
  rowSub: { color: MUTED, fontSize: 12, marginTop: 4 },

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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: { color: TEXT, fontWeight: '900', fontSize: 16 },

  label: { color: MUTED, marginTop: 6, marginBottom: 6, fontWeight: '800' },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: TEXT,
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
  outlineText: { color: TEXT, fontWeight: '900' },

  primaryBtn: {
    backgroundColor: ACCENT,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 110,
    alignItems: 'center',
  },
  primaryText: { color: '#001018', fontWeight: '900' },

  dangerBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 110,
    alignItems: 'center',
  },
  dangerText: { color: '#fff', fontWeight: '900' },

  err: { color: '#dc2626', marginTop: 10, fontWeight: '800' },
})

