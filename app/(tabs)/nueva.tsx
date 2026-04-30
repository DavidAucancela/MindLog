import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/api/client';
import { T } from '@/constants/theme';

const EMO_OPTIONS = Object.entries(T.emo).map(([key, val]) => ({ key, ...val }));

const PROMPTS = [
  '¿Qué pasó hoy?',
  '¿Qué tenés en la cabeza?',
  '¿Cómo llegaste a este momento?',
  '¿Qué querés recordar de hoy?',
];

function todayLabel() {
  return new Date().toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

export default function NuevaEntradaScreen() {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const inputRef = useRef<TextInput>(null);

  const placeholder = PROMPTS[new Date().getDay() % PROMPTS.length];
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const canSave = content.trim().length >= 10 && !saving;

  function handleBack() {
    if (content.trim().length > 0) {
      Alert.alert(
        'Descartar entrada',
        'Si salís ahora, perderás lo que escribiste.',
        [
          { text: 'Seguir escribiendo', style: 'cancel' },
          { text: 'Descartar', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  }

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      const body: { content: string; mood?: string } = { content };
      if (mood) body.mood = mood;
      const res = await api.post('/entries', body, token);
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || errJson.error || 'No pudimos guardar tu entrada.');
      }
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      await queryClient.invalidateQueries({ queryKey: ['entries'] });
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No pudimos guardar tu entrada.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Barra superior */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          accessibilityLabel="Volver"
          accessibilityRole="button"
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.topDate}>{todayLabel()}</Text>

        <TouchableOpacity
          style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!canSave}
          accessibilityLabel="Guardar entrada"
          accessibilityRole="button"
        >
          {saving
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={[styles.saveBtnText, !canSave && styles.saveBtnTextOff]}>
                Guardar
              </Text>
          }
        </TouchableOpacity>
      </View>

      {/* Área de texto */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollInner}
        keyboardShouldPersistTaps="handled"
        onStartShouldSetResponder={() => { inputRef.current?.focus(); return false; }}
      >
        <TextInput
          ref={inputRef}
          style={styles.textarea}
          placeholder={placeholder}
          placeholderTextColor={T.ink3}
          value={content}
          onChangeText={setContent}
          multiline
          autoFocus
          textAlignVertical="top"
          accessibilityLabel="Área de escritura"
          accessibilityHint="Escribí tu entrada de diario"
        />
        {wordCount > 0 && (
          <Text style={styles.wordCount} accessibilityLabel={`${wordCount} palabras`}>
            {wordCount} {wordCount === 1 ? 'palabra' : 'palabras'}
          </Text>
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
            const selected = mood === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.moodChip,
                  selected && { backgroundColor: opt.color + '22', borderColor: opt.color },
                ]}
                onPress={() => setMood(selected ? null : opt.key)}
                accessibilityLabel={opt.label}
                accessibilityRole="button"
                accessibilityState={{ selected }}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: 8,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: T.ink2, lineHeight: 34 },
  topDate: {
    fontSize: 12, color: T.ink3, letterSpacing: 0.3,
    textTransform: 'lowercase', flex: 1, textAlign: 'center',
  },
  saveBtn: {
    paddingHorizontal: 18, paddingVertical: 9,
    borderRadius: T.rBtn, backgroundColor: T.brown,
    minWidth: 76, alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: 'transparent', borderWidth: 0.5, borderColor: T.border },
  saveBtnText: { fontWeight: '600', fontSize: 14, color: '#fff' },
  saveBtnTextOff: { color: T.ink3 },

  scroll: { flex: 1 },
  scrollInner: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20 },
  textarea: {
    flex: 1,
    fontFamily: 'Lora_400Regular',
    fontSize: 19,
    lineHeight: 32,
    color: T.ink,
    letterSpacing: -0.1,
    minHeight: 200,
  },
  wordCount: {
    marginTop: 16, fontSize: 12, color: T.ink3, letterSpacing: 0.3,
  },

  moodBar: {
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 0.5, borderTopColor: T.border,
    backgroundColor: T.bg,
  },
  moodLabel: {
    fontSize: 11, color: T.ink3, letterSpacing: 0.6,
    textTransform: 'lowercase', paddingHorizontal: 20, marginBottom: 10,
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
