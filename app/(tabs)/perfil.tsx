import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { api } from '@/api/client';
import { T } from '@/constants/theme';

interface Stats {
  total: number;
  streak: number;
  top_mood: string | null;
}

const MOOD_SHAPES: Record<string, string> = {
  calmo:     '◯',
  inquieto:  '△',
  pensativo: '◇',
  grato:     '☀',
  triste:    '◠',
  enfocado:  '▣',
};

export default function PerfilScreen() {
  const { user, token, logout } = useAuthStore();
  const { clearMessages } = useChatStore();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await api.get('/stats', token);
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || errJson.error || 'Error al cargar estadísticas');
      }
      const json = await res.json();
      if (!json.data) throw new Error(json.error || 'Sin datos');
      return json.data as Stats;
    },
    enabled: !!token,
    retry: 1,
  });

  function handleLogout() {
    Alert.alert('Cerrar sesión', '¿Seguro que querés salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await logout();
          clearMessages();
          queryClient.clear();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  const initial = user?.name?.charAt(0).toUpperCase() ?? '?';
  const moodData = stats?.top_mood ? T.emo[stats.top_mood] : null;
  const moodColor = moodData?.color ?? T.brown;
  const moodShape = stats?.top_mood ? MOOD_SHAPES[stats.top_mood] ?? '◯' : null;

  return (
    <View style={styles.container}>
      {/* Avatar con ánimo */}
      <View style={styles.avatarWrapper}>
        <View style={[styles.avatar, { borderColor: moodColor }]}>
          <Text style={[styles.avatarText, { color: moodColor }]}>{initial}</Text>
        </View>
        {moodShape && (
          <View style={[styles.moodBadge, { backgroundColor: moodColor }]}>
            <Text style={styles.moodBadgeShape}>{moodShape}</Text>
          </View>
        )}
      </View>

      <Text style={styles.name}>{user?.name ?? 'Usuario'}</Text>
      <Text style={styles.email}>{user?.email ?? ''}</Text>

      {moodData && (
        <View style={[styles.moodPill, { backgroundColor: moodColor + '22', borderColor: moodColor + '55' }]}>
          <View style={[styles.moodDot, { backgroundColor: moodColor }]} />
          <Text style={[styles.moodPillText, { color: moodColor }]}>
            tu ánimo frecuente: {moodData.label}
          </Text>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsRow}>
        {statsLoading ? (
          <ActivityIndicator color={T.brown} style={{ marginVertical: 8 }} />
        ) : stats ? (
          <>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>entradas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.streak}</Text>
              <Text style={styles.statLabel}>días seguidos</Text>
            </View>
          </>
        ) : null}
      </View>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: T.bg,
    alignItems: 'center', paddingTop: 64, paddingHorizontal: 24,
  },

  avatarWrapper: { position: 'relative', marginBottom: 16 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: T.bg2, borderWidth: 2.5,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: 'Lora_500Medium', fontSize: 32 },
  moodBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: T.bg,
  },
  moodBadgeShape: { fontSize: 11, color: '#fff' },

  name: { fontFamily: 'Lora_500Medium', fontSize: 22, color: T.ink, marginBottom: 4, letterSpacing: -0.3 },
  email: { fontSize: 14, color: T.ink2, marginBottom: 16 },

  moodPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: T.rChip, borderWidth: 0.5, marginBottom: 28,
  },
  moodDot: { width: 8, height: 8, borderRadius: 4 },
  moodPillText: { fontSize: 13, fontWeight: '500', textTransform: 'lowercase' },

  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: T.card, borderRadius: T.rCard,
    borderWidth: 0.5, borderColor: T.border,
    paddingVertical: 20, paddingHorizontal: 32, gap: 0,
    width: '100%',
  },
  statCard: { alignItems: 'center', flex: 1 },
  statNumber: { fontFamily: 'Lora_500Medium', fontSize: 24, color: T.ink, letterSpacing: -0.5 },
  statLabel: { fontSize: 11, color: T.ink2, marginTop: 4, textTransform: 'lowercase', letterSpacing: 0.3 },
  statDivider: { width: 0.5, height: 36, backgroundColor: T.border },

  divider: { width: '100%', height: 0.5, backgroundColor: T.border, marginVertical: 36 },
  logoutBtn: {
    borderWidth: 0.5, borderColor: T.border,
    paddingHorizontal: 32, paddingVertical: 12, borderRadius: T.rChip,
  },
  logoutText: { color: T.ink2, fontSize: 14, fontWeight: '500' },
});
