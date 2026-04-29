import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/api/client';
import { T } from '@/constants/theme';
import { EmoBadge } from '@/components/EmoBadge';
import type { Entry } from '@/store/entriesStore';

function greeting(): string {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return 'Buenos días';
  if (h >= 12 && h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

function formatDateLong(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function EntryCard({ entry }: { entry: Entry }) {
  const preview =
    entry.content.length > 110 ? entry.content.slice(0, 110) + '...' : entry.content;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/entry/${entry.id}`)}
    >
      <View style={styles.cardRow}>
        <Text style={styles.cardDate}>{formatDateLong(entry.created_at)}</Text>
        {entry.mood ? <EmoBadge mood={entry.mood} /> : null}
      </View>
      <Text style={styles.cardPreview}>{preview}</Text>
    </TouchableOpacity>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

type ListItem =
  | { type: 'section'; label: string }
  | { type: 'entry'; entry: Entry };

function buildItems(entries: Entry[]): ListItem[] {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recent = entries.filter(e => new Date(e.created_at) >= sevenDaysAgo);
  const older = entries.filter(e => new Date(e.created_at) < sevenDaysAgo);

  const items: ListItem[] = [];
  if (recent.length > 0) {
    items.push({ type: 'section', label: 'esta semana' });
    recent.forEach(e => items.push({ type: 'entry', entry: e }));
  }
  if (older.length > 0) {
    items.push({ type: 'section', label: 'antes' });
    older.forEach(e => items.push({ type: 'entry', entry: e }));
  }
  return items;
}

const PAGE_SIZE = 20;

export default function HomeScreen() {
  const { token, user } = useAuthStore();

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['entries'],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await api.get(`/entries?skip=${pageParam}&limit=${PAGE_SIZE}`, token);
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || errJson.error || 'Error al cargar entradas');
      }
      const json = await res.json();
      if (!json.data) throw new Error(json.error || 'Sin datos');
      return json.data as { entries: Entry[]; has_more: boolean };
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage.has_more ? pages.length * PAGE_SIZE : undefined,
    initialPageParam: 0,
    enabled: !!token,
    retry: 1,
  });

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator color={T.brown} /></View>;
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No se pudo conectar al servidor.</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const entries = data?.pages.flatMap(p => p.entries) ?? [];
  const items = buildItems(entries);
  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  const ListHeader = (
    <View style={styles.header}>
      <Text style={styles.headerDate}>{today}</Text>
      <Text style={styles.headerGreeting}>
        {greeting()},{'\n'}
        <Text style={styles.headerName}>{user?.name?.split(' ')[0] ?? 'tú'}.</Text>
      </Text>
    </View>
  );

  if (entries.length === 0) {
    return (
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.emptyContainer}
        data={[]}
        renderItem={null}
        refreshControl={<RefreshControl onRefresh={refetch} refreshing={isRefetching} tintColor={T.brown} />}
        ListHeaderComponent={
          <>
            {ListHeader}
            <View style={styles.emptyInner}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>✎</Text>
              </View>
              <Text style={styles.emptyTitle}>Tu cuaderno está en blanco.</Text>
              <Text style={styles.emptyBody}>
                Empieza con cualquier cosa — un detalle del día,{'\n'}algo que pensaste mientras venías.
              </Text>
            </View>
          </>
        }
      />
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.list}
      data={items}
      keyExtractor={item => item.type === 'section' ? item.label : item.entry.id}
      renderItem={({ item }) =>
        item.type === 'section'
          ? <SectionLabel>{item.label}</SectionLabel>
          : <EntryCard entry={item.entry} />
      }
      refreshControl={<RefreshControl onRefresh={refetch} refreshing={isRefetching} tintColor={T.brown} />}
      onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
      onEndReachedThreshold={0.3}
      ListHeaderComponent={ListHeader}
      ListFooterComponent={
        isFetchingNextPage
          ? <ActivityIndicator color={T.brown} style={styles.loadingMore} />
          : null
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.bg, gap: 16 },
  errorText: { fontSize: 15, color: T.ink2, textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: T.rBtn, borderWidth: 0.5, borderColor: T.border },
  retryText: { fontSize: 14, color: T.brown, fontWeight: '500' },
  list: { paddingBottom: 100 },
  emptyContainer: { flexGrow: 1, paddingBottom: 100 },

  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 },
  headerDate: { fontSize: 13, color: T.ink2, letterSpacing: 0.4, textTransform: 'lowercase', marginBottom: 6 },
  headerGreeting: { fontFamily: 'Lora_500Medium', fontSize: 28, color: T.ink, lineHeight: 36, letterSpacing: -0.3 },
  headerName: { fontFamily: 'Lora_400Regular_Italic', fontSize: 28, color: T.brown },

  sectionLabel: {
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10,
    fontFamily: 'System', fontSize: 11, color: T.ink2,
    textTransform: 'lowercase', letterSpacing: 1.2, fontWeight: '500',
  },

  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: T.card,
    borderRadius: T.rCard,
    padding: 18,
    borderWidth: 0.5,
    borderColor: T.border,
    gap: 8,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardDate: { fontSize: 12, color: T.ink2, letterSpacing: 0.3, textTransform: 'lowercase', fontWeight: '500' },
  cardPreview: { fontFamily: 'Lora_400Regular', fontSize: 15, color: T.ink2, lineHeight: 22 },

  emptyInner: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32, gap: 12 },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: T.brownTint,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  emptyIconText: { fontSize: 28, color: T.brown },
  emptyTitle: { fontFamily: 'Lora_500Medium', fontSize: 20, color: T.ink, lineHeight: 26, textAlign: 'center' },
  emptyBody: { fontSize: 14, color: T.ink2, lineHeight: 22, textAlign: 'center' },

  loadingMore: { paddingVertical: 20 },
});
