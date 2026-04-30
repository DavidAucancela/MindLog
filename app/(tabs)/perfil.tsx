import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
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
  calmo: '◯', inquieto: '△', pensativo: '◇',
  grato: '☀', triste: '◠', enfocado: '▣',
};

const AVATAR_COLORS = [
  T.brown,
  T.emo.calmo.color,
  T.emo.grato.color,
  T.emo.enfocado.color,
  T.emo.pensativo.color,
  T.emo.inquieto.color,
  T.emo.triste.color,
];

const AVATAR_COLOR_KEY = 'avatar_color';

function SummaryCard({ token }: { token: string | null }) {
  const hour = new Date().getHours();
  const showSummary = hour >= 18 || hour < 4;

  const { data, isLoading } = useQuery({
    queryKey: ['summary-daily'],
    queryFn: async () => {
      const res = await api.get('/summary/daily', token);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      return json.data as { summary: string | null; message?: string };
    },
    enabled: !!token && showSummary,
    staleTime: 1000 * 60 * 30,
  });

  if (!showSummary) return null;

  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>tu día</Text>
      {isLoading ? (
        <ActivityIndicator color={T.brown} style={{ marginVertical: 8 }} />
      ) : data?.summary ? (
        <Text style={styles.summaryText}>{data.summary}</Text>
      ) : (
        <Text style={styles.summaryEmpty}>
          {data?.message ?? 'Escribí algo hoy para ver tu resumen.'}
        </Text>
      )}
    </View>
  );
}

export default function PerfilScreen() {
  const { user, token, logout, setAuth } = useAuthStore();
  const { clearMessages } = useChatStore();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatarColor, setAvatarColor] = useState<string | null>(null);
  const [editColor, setEditColor] = useState<string | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync(AVATAR_COLOR_KEY).then(c => {
      if (c) { setAvatarColor(c); setEditColor(c); }
    });
  }, []);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await api.get('/stats', token);
      if (!res.ok) throw new Error('Error al cargar estadísticas');
      const json = await res.json();
      return json.data as Stats;
    },
    enabled: !!token,
    retry: 1,
  });

  function startEditing() {
    setEditName(user?.name ?? '');
    setEditColor(avatarColor);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
  }

  async function handleSave() {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const res = await api.patch('/auth/me', { name: editName.trim() }, token);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      // Actualizar color de avatar localmente
      if (editColor) {
        await SecureStore.setItemAsync(AVATAR_COLOR_KEY, editColor);
        setAvatarColor(editColor);
      }
      // Actualizar user en el store
      await setAuth(token!, json.data);
      setEditing(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo guardar el perfil.');
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    Alert.alert('Cerrar sesión', '¿Seguro que querés salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir', style: 'destructive',
        onPress: async () => {
          await logout();
          clearMessages();
          queryClient.clear();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  const moodData = stats?.top_mood ? T.emo[stats.top_mood] : null;
  const moodColor = moodData?.color ?? T.brown;
  const moodShape = stats?.top_mood ? MOOD_SHAPES[stats.top_mood] ?? '◯' : null;
  const displayColor = avatarColor ?? moodColor;
  const initial = user?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header con botón editar */}
      <View style={styles.topBar}>
        <View style={{ flex: 1 }} />
        {editing ? (
          <View style={styles.topActions}>
            <TouchableOpacity onPress={cancelEditing} style={styles.topBtn}>
              <Text style={styles.topBtnCancel}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.topBtn, styles.topBtnSave]}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.topBtnSaveText}>Guardar</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={startEditing} style={styles.topBtn}>
            <Text style={styles.topBtnEdit}>Editar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <View style={[styles.avatar, { borderColor: editing ? (editColor ?? displayColor) : displayColor }]}>
          <Text style={[styles.avatarText, { color: editing ? (editColor ?? displayColor) : displayColor }]}>
            {initial}
          </Text>
        </View>
        {!editing && moodShape && (
          <View style={[styles.moodBadge, { backgroundColor: displayColor }]}>
            <Text style={styles.moodBadgeShape}>{moodShape}</Text>
          </View>
        )}
      </View>

      {editing ? (
        <>
          {/* Selector de color */}
          <View style={styles.colorPicker}>
            {AVATAR_COLORS.map((color, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color },
                  editColor === color && styles.colorCircleSelected,
                ]}
                onPress={() => setEditColor(color)}
              />
            ))}
          </View>

          {/* Nombre editable */}
          <TextInput
            style={styles.nameInput}
            value={editName}
            onChangeText={setEditName}
            placeholder="Tu nombre"
            placeholderTextColor={T.ink3}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
        </>
      ) : (
        <>
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
        </>
      )}

      {/* Stats */}
      {!editing && (statsLoading || !!stats) && (
        <View style={styles.statsRow}>
          {statsLoading ? (
            <ActivityIndicator color={T.brown} style={{ marginVertical: 8 }} />
          ) : (
            <>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats!.total}</Text>
                <Text style={styles.statLabel}>entradas</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats!.streak}</Text>
                <Text style={styles.statLabel}>
                  {stats!.streak === 1 ? 'día seguido' : 'días seguidos'}
                </Text>
              </View>
            </>
          )}
        </View>
      )}

      {!editing && <SummaryCard token={token} />}

      {!editing && (
        <>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: T.bg },
  container: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 60,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: 8,
  },
  topActions: { flexDirection: 'row', gap: 8 },
  topBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: T.rChip,
  },
  topBtnEdit: { fontSize: 14, color: T.brown, fontWeight: '500' },
  topBtnCancel: { fontSize: 14, color: T.ink2 },
  topBtnSave: { backgroundColor: T.brown },
  topBtnSaveText: { fontSize: 14, color: '#fff', fontWeight: '600' },

  avatarWrapper: { position: 'relative', marginBottom: 16, marginTop: 8 },
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

  colorPicker: {
    flexDirection: 'row', gap: 12, marginBottom: 20,
  },
  colorCircle: {
    width: 32, height: 32, borderRadius: 16,
  },
  colorCircleSelected: {
    borderWidth: 3, borderColor: T.ink,
    transform: [{ scale: 1.15 }],
  },

  nameInput: {
    fontSize: 20,
    fontFamily: 'Lora_500Medium',
    color: T.ink,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: T.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: '100%',
    marginBottom: 24,
    letterSpacing: -0.3,
  },

  name: {
    fontFamily: 'Lora_500Medium', fontSize: 22,
    color: T.ink, marginBottom: 4, letterSpacing: -0.3,
  },
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
    paddingVertical: 20, paddingHorizontal: 32,
    width: '100%', marginBottom: 20,
  },
  statCard: { alignItems: 'center', flex: 1 },
  statNumber: {
    fontFamily: 'Lora_500Medium', fontSize: 24,
    color: T.ink, letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11, color: T.ink2, marginTop: 4,
    textTransform: 'lowercase', letterSpacing: 0.3,
  },
  statDivider: { width: 0.5, height: 36, backgroundColor: T.border },

  summaryCard: {
    width: '100%', backgroundColor: T.card,
    borderRadius: T.rCard, borderWidth: 0.5, borderColor: T.border,
    padding: 20, marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 11, color: T.ink3, textTransform: 'lowercase',
    letterSpacing: 0.8, marginBottom: 10,
  },
  summaryText: {
    fontFamily: 'Lora_400Regular', fontSize: 15, color: T.ink2, lineHeight: 24,
  },
  summaryEmpty: { fontSize: 14, color: T.ink3, lineHeight: 20, fontStyle: 'italic' },

  divider: { width: '100%', height: 0.5, backgroundColor: T.border, marginBottom: 28 },
  logoutBtn: {
    borderWidth: 0.5, borderColor: T.border,
    paddingHorizontal: 32, paddingVertical: 12, borderRadius: T.rChip,
  },
  logoutText: { color: T.ink2, fontSize: 14, fontWeight: '500' },
});
