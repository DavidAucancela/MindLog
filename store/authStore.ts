import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  setAuth: (token: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredToken: () => Promise<void>;
}

const storage = {
  set: (key: string, value: string) =>
    Platform.OS === 'web'
      ? Promise.resolve(localStorage.setItem(key, value))
      : SecureStore.setItemAsync(key, value),

  get: (key: string) =>
    Platform.OS === 'web'
      ? Promise.resolve(localStorage.getItem(key))
      : SecureStore.getItemAsync(key),

  delete: (key: string) =>
    Platform.OS === 'web'
      ? Promise.resolve(localStorage.removeItem(key))
      : SecureStore.deleteItemAsync(key),
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: true,

  setAuth: async (token, user) => {
    await storage.set('auth_token', token);
    await storage.set('auth_user', JSON.stringify(user));
    set({ token, user });
  },

  logout: async () => {
    await storage.delete('auth_token');
    await storage.delete('auth_user');
    set({ token: null, user: null });
  },

  loadStoredToken: async () => {
    try {
      const raw = await storage.get('auth_token');
      // Los JWT siempre empiezan con "eyJ". Descarta tokens de preview u otros valores inválidos.
      const token = raw?.startsWith('eyJ') ? raw : null;
      const userStr = token ? await storage.get('auth_user') : null;
      const user: AuthUser | null = userStr ? JSON.parse(userStr) : null;
      if (!token) {
        await storage.delete('auth_token');
        await storage.delete('auth_user');
      }
      set({ token, user, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
