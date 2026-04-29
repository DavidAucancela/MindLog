import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { usePreviewStore, PREVIEW_USER } from '@/store/previewStore';
import { api } from '@/api/client';
import { T } from '@/constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const startPreview = usePreviewStore((s) => s.startPreview);

  function handlePreview() {
    startPreview();
    setAuth('preview-token', PREVIEW_USER);
    router.replace('/(tabs)');
  }

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Campos requeridos', 'Ingresá tu email y contraseña.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || errJson.error || 'No pudimos iniciar sesión.');
      }
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      await setAuth(json.data.token, json.data.user);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No pudimos iniciar sesión.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.logo}>MindLog</Text>
        <Text style={styles.subtitle}>Tu diario personal con IA</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={T.ink3}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor={T.ink3}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.link}>¿No tenés cuenta? Registrate</Text>
        </TouchableOpacity>

        <View style={styles.previewDivider}>
          <View style={styles.previewLine} />
          <Text style={styles.previewOr}>o</Text>
          <View style={styles.previewLine} />
        </View>

        <TouchableOpacity style={styles.previewBtn} onPress={handlePreview}>
          <Text style={styles.previewBtnText}>Ver demo del diseño</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  logo: {
    fontFamily: 'Lora_600SemiBold',
    fontSize: 38,
    color: T.ink,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 15, color: T.ink2, textAlign: 'center', marginBottom: 48 },
  input: {
    backgroundColor: T.bg2,
    borderRadius: T.rBtn,
    padding: 16,
    marginBottom: 12,
    fontSize: 16,
    color: T.ink,
    borderWidth: 0.5,
    borderColor: T.border,
  },
  button: {
    backgroundColor: T.brown,
    borderRadius: T.rBtn,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  link: { color: T.brown, textAlign: 'center', fontSize: 14 },
  previewDivider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 28, marginBottom: 16 },
  previewLine: { flex: 1, height: 0.5, backgroundColor: T.border },
  previewOr: { fontSize: 12, color: T.ink3 },
  previewBtn: {
    borderWidth: 0.5, borderColor: T.border, borderRadius: T.rBtn,
    padding: 14, alignItems: 'center',
  },
  previewBtnText: { fontSize: 14, color: T.ink2 },
});
