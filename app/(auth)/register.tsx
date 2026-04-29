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
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/api/client';
import { T } from '@/constants/theme';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  async function handleRegister() {
    if (!name || !email || !password) {
      Alert.alert('Campos requeridos', 'Por favor completá todos los campos.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || errJson.error || 'No pudimos crear la cuenta.');
      }
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      await setAuth(json.data.token, json.data.user);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No pudimos crear la cuenta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.logo}>MindLog</Text>
        <Text style={styles.subtitle}>Creá tu espacio de reflexión</Text>

        <TextInput
          style={styles.input}
          placeholder="Tu nombre"
          placeholderTextColor={T.ink3}
          value={name}
          onChangeText={setName}
        />
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
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Creando cuenta...' : 'Crear cuenta'}</Text>
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
});
