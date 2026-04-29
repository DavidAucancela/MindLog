import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { usePreviewStore, PREVIEW_ENTRIES, PREVIEW_CHAT_RESPONSE } from '@/store/previewStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

function getToken(): string | null {
  return useAuthStore.getState().token;
}

function isPreview(): boolean {
  return usePreviewStore.getState().isPreview;
}

function mockResponse(data: unknown): Response {
  return new Response(JSON.stringify({ data, error: null }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Si el backend devuelve 401, limpia la sesión y manda al login
async function handleUnauthorized(res: Response): Promise<Response> {
  if (res.status === 401 && !isPreview()) {
    await useAuthStore.getState().logout();
    router.replace('/(auth)/login');
  }
  return res;
}

// Respuestas mock para el modo demo (sin backend)
function previewResponse(method: string, path: string): Response | null {
  if (path.startsWith('/entries') && method === 'GET' && !path.includes('/', 8))
    return mockResponse({ entries: PREVIEW_ENTRIES, has_more: false });
  if (path === '/entries' && method === 'POST') return mockResponse(PREVIEW_ENTRIES[0]);
  if (path === '/chat/stream' && method === 'POST') return mockResponse({ response: PREVIEW_CHAT_RESPONSE });
  if (path === '/summary/daily') return mockResponse({ summary: 'Esta semana escribiste sobre escuchar, sobre el tiempo que te das a vos mismo. La pregunta para mañana: ¿qué necesitás que sea más lento?' });
  if (path === '/stats') return mockResponse({ total: PREVIEW_ENTRIES.length, streak: 3, top_mood: 'pensativo' });
  return null;
}

function authHeaders(token?: string | null): Record<string, string> {
  const t = token ?? getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export const api = {
  get: (path: string, token?: string | null) => {
    if (isPreview()) {
      const mock = previewResponse('GET', path);
      if (mock) return Promise.resolve(mock);
    }
    return fetch(`${API_URL}${path}`, { headers: authHeaders(token) }).then(handleUnauthorized);
  },

  post: (path: string, body: unknown, token?: string | null) => {
    if (isPreview()) {
      const mock = previewResponse('POST', path);
      if (mock) return Promise.resolve(mock);
    }
    return fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify(body),
    }).then(handleUnauthorized);
  },

  delete: (path: string, token?: string | null) => {
    return fetch(`${API_URL}${path}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }).then(handleUnauthorized);
  },
};
