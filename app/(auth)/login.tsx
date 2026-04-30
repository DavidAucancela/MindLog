import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { usePreviewStore, PREVIEW_USER } from '@/store/previewStore';
import { api } from '@/api/client';
import { T } from '@/constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);
  const setAuth = useAuthStore((s) => s.setAuth);
  const startPreview = usePreviewStore((s) => s.startPreview);
  const stopPreview = usePreviewStore((s) => s.stopPreview);
  const queryClient = useQueryClient();

  function handlePreview() {
    startPreview();
    setAuth('preview-token', PREVIEW_USER);
    router.replace('/(tabs)');
  }

  async function handleLogin() {
    setError(null);
    if (!email.trim() || !password) {
      setError('Ingresá tu email y contraseña.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email: email.trim(), password });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || errJson.error || 'Credenciales incorrectas.');
      }
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      stopPreview();
      queryClient.clear();
      await setAuth(json.data.token, json.data.user);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(
        e?.message?.includes('Network request failed')
          ? 'No se pudo conectar al servidor.'
          : e.message || 'No pudimos iniciar sesión.'
      );
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
          onChangeText={t => { setEmail(t); setError(null); }}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          blurOnSubmit={false}
          editable={!loading}
        />

        <View>
          <TextInput
            ref={passwordRef}
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={T.ink3}
            value={password}
            onChangeText={t => { setPassword(t); setError(null); }}
            secureTextEntry={!showPassword}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowPassword(v => !v)}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={T.ink3}
            />
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.buttonText}>Entrar</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.link}>¿No tenés cuenta? Registrate</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o</Text>
          <View style={styles.dividerLine} />
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
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingRight: 48,
    marginBottom: 12,
    fontSize: 16,
    color: T.ink,
    borderWidth: 0.5,
    borderColor: T.border,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 12,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  errorText: {
    fontSize: 13,
    color: T.warn,
    marginBottom: 12,
    lineHeight: 18,
  },

  button: {
    backgroundColor: T.brown,
    borderRadius: T.rBtn,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  link: { color: T.brown, textAlign: 'center', fontSize: 14 },

  divider: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, marginTop: 28, marginBottom: 16,
  },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: T.border },
  dividerText: { fontSize: 12, color: T.ink3 },

  previewBtn: {
    borderWidth: 0.5, borderColor: T.border,
    borderRadius: T.rBtn, padding: 14, alignItems: 'center',
  },
  previewBtnText: { fontSize: 14, color: T.ink2 },
});
