import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/api/client';
import { T, resolveEmo } from '@/constants/theme';
import { EmoBadge } from '@/components/EmoBadge';
import type { Entry } from '@/store/entriesStore';

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          {entry?.mood && <EmoBadge mood={entry.mood} />}
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>Eliminar</Text>
          </TouchableOpacity>
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
    </View>
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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: T.rChip,
    borderWidth: 0.5,
    borderColor: T.warn,
  },
  deleteBtnText: { fontSize: 13, color: T.warn, fontWeight: '500' },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 60 },

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
});
