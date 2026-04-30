import { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/api/client';
import { T } from '@/constants/theme';
import { EmoBadge } from '@/components/EmoBadge';
import type { Entry } from '@/store/entriesStore';

const EMO_OPTIONS = Object.entries(T.emo).map(([key, val]) => ({ key, ...val }));

function formatDateFull(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editMood, setEditMood] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const { data: entry, isLoading } = useQuery({
    queryKey: ['entry', id],
    queryFn: async () => {
      const res = await api.get(`/entries/${id}`, token);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      return json.data as Entry;
    },
    enabled: !!id && !!token,
    initialData: () => {
      const cached = queryClient.getQueryData<{
        pages: { entries: Entry[]; has_more: boolean }[];
      }>(['entries']);
      return cached?.pages.flatMap(p => p.entries).find(e => e.id === id);
    },
  });

  function startEditing() {
    if (!entry) return;
    setEditContent(entry.content);
    setEditMood(entry.mood ?? null);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function cancelEditing() {
    setEditing(false);
  }

  async function handleSave() {
    if (!editContent.trim() || saving) return;
    setSaving(true);
    try {
      const body: { content: string; mood?: string } = { content: editContent.trim() };
      if (editMood) body.mood = editMood;
      const res = await api.patch(`/entries/${id}`, body, token);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      queryClient.setQueryData(['entry', id], json.data);
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      setEditing(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo guardar la entrada.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    Alert.alert('Eliminar entrada', '¿Querés borrar esta entrada? No se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await api.delete(`/entries/${id}`, token);
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            queryClient.invalidateQueries({ queryKey: ['entries'] });
            queryClient.removeQueries({ queryKey: ['entry', id] });
            router.back();
          } catch (e: any) {
            Alert.alert('Error', e.message || 'No se pudo eliminar la entrada.');
          }
        },
      },
    ]);
  }

  const wordCount = editContent.trim() ? editContent.trim().split(/\s+/).length : 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={editing ? cancelEditing : () => router.back()}
        >
          <Text style={styles.backIcon}>{editing ? '✕' : '‹'}</Text>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          {!editing && entry?.mood && <EmoBadge mood={entry.mood} />}
          {editing ? (
            <TouchableOpacity
              style={[styles.actionBtn, styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving || !editContent.trim()}
            >
              {saving
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.saveBtnText}>Guardar</Text>}
            </TouchableOpacity>
          ) : (
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={startEditing}>
                <Text style={styles.editBtnText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={handleDelete}>
                <Text style={styles.deleteBtnText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={T.brown} />
        </View>
      ) : !entry ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>No se encontró la entrada.</Text>
        </View>
      ) : editing ? (
        <>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <TextInput
              ref={inputRef}
              style={styles.textarea}
              value={editContent}
              onChangeText={setEditContent}
              multiline
              textAlignVertical="top"
              autoFocus
            />
            {wordCount > 0 && (
              <Text style={styles.wordCount}>{wordCount} palabras</Text>
            )}
          </ScrollView>

          {/* Selector de ánimo */}
          <View style={styles.moodBar}>
            <Text style={styles.moodLabel}>¿cómo te sentís?</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.moodRow}
            >
              {EMO_OPTIONS.map(opt => {
                const selected = editMood === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.moodChip,
                      selected && { backgroundColor: opt.color + '22', borderColor: opt.color },
                    ]}
                    onPress={() => setEditMood(selected ? null : opt.key)}
                  >
                    <View style={[styles.moodDot, { backgroundColor: opt.color }]} />
                    <Text style={[styles.moodChipText, selected && { color: opt.color, fontWeight: '600' }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.date}>{formatDateFull(entry.created_at)}</Text>

          <View style={styles.writingArea}>
            <View style={styles.marginLine} />
            <Text style={styles.content}>{entry.content}</Text>
          </View>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: T.ink2, fontSize: 15 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: 12,
    backgroundColor: T.bg,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: T.ink2, lineHeight: 34 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: T.rChip,
    borderWidth: 0.5,
    borderColor: T.border,
  },
  editBtnText: { fontSize: 13, color: T.brown, fontWeight: '500' },
  deleteBtn: { borderColor: T.warn },
  deleteBtnText: { fontSize: 13, color: T.warn, fontWeight: '500' },
  saveBtn: { backgroundColor: T.brown, borderColor: T.brown },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontSize: 13, color: '#fff', fontWeight: '600' },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  date: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 24,
    fontSize: 12,
    color: T.ink2,
    letterSpacing: 0.3,
    textTransform: 'lowercase',
  },

  writingArea: { flexDirection: 'row', paddingBottom: 24 },
  marginLine: {
    width: 0.5,
    backgroundColor: T.border,
    marginLeft: 56,
    alignSelf: 'stretch',
  },
  content: {
    flex: 1,
    paddingLeft: 16,
    paddingRight: 24,
    fontFamily: 'Lora_400Regular',
    fontSize: 18,
    lineHeight: 32,
    color: T.ink,
    letterSpacing: -0.1,
  },

  textarea: {
    flex: 1,
    fontFamily: 'Lora_400Regular',
    fontSize: 18,
    lineHeight: 32,
    color: T.ink,
    letterSpacing: -0.1,
    paddingHorizontal: 24,
    paddingTop: 8,
    minHeight: 200,
  },
  wordCount: {
    marginTop: 12,
    marginHorizontal: 24,
    fontSize: 12,
    color: T.ink3,
    letterSpacing: 0.3,
  },

  moodBar: {
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 0.5,
    borderTopColor: T.border,
    backgroundColor: T.bg,
  },
  moodLabel: {
    fontSize: 11,
    color: T.ink3,
    letterSpacing: 0.6,
    textTransform: 'lowercase',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  moodRow: { paddingHorizontal: 16, gap: 8 },
  moodChip: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: T.rChip, borderWidth: 0.5, borderColor: T.border,
    backgroundColor: T.card,
  },
  moodDot: { width: 9, height: 9, borderRadius: 5 },
  moodChipText: { fontSize: 13, color: T.ink2 },
});
