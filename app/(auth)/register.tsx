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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { usePreviewStore } from '@/store/previewStore';
import { api } from '@/api/client';
import { T } from '@/constants/theme';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const setAuth = useAuthStore((s) => s.setAuth);
  const stopPreview = usePreviewStore((s) => s.stopPreview);
  const queryClient = useQueryClient();

  async function handleRegister() {
    setError(null);
    if (!name.trim() || !email.trim() || !password) {
      setError('Por favor completá todos los campos.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || errJson.error || 'No pudimos crear la cuenta.');
      }
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      stopPreview();
      queryClient.clear();
      await setAuth(json.data.token, json.data.user);
      router.replace('/(tabs)');
    } catch (e: any) {
      const msg = e?.message?.includes('Network request failed')
        ? 'No se pudo conectar al servidor. Verificá tu conexión.'
        : (e.message || 'No pudimos crear la cuenta.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>MindLog</Text>
        <Text style={styles.subtitle}>Creá tu espacio de reflexión</Text>

        <TextInput
          style={styles.input}
          placeholder="Tu nombre"
          placeholderTextColor={T.ink3}
          value={name}
          onChangeText={t => { setName(t); setError(null); }}
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          blurOnSubmit={false}
        />
        <TextInput
          ref={emailRef}
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
        />

        <View style={styles.passwordWrap}>
          <TextInput
            ref={passwordRef}
            style={styles.passwordInput}
            placeholder="Contraseña (mín. 6 caracteres)"
            placeholderTextColor={T.ink3}
            value={password}
            onChangeText={t => { setPassword(t); setError(null); }}
            secureTextEntry={!showPassword}
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowPassword(v => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
          onPress={handleRegister}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.buttonText}>Crear cuenta</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>¿Ya tenés cuenta? Iniciá sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 60 },

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
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.bg2,
    borderRadius: T.rBtn,
    borderWidth: 0.5,
    borderColor: T.border,
    marginBottom: 12,
    paddingRight: 14,
  },
  passwordInput: { flex: 1, padding: 16, fontSize: 16, color: T.ink },
  eyeBtn: { padding: 4 },

  errorText: {
    fontSize: 13,
    color: T.warn,
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 18,
  },

  button: {
    backgroundColor: T.brown,
    borderRadius: T.rBtn,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
    height: 52,
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  link: { color: T.brown, textAlign: 'center', fontSize: 14 },
});
