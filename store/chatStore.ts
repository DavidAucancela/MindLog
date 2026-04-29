import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  streaming?: boolean;
}

interface ChatState {
  messages: ChatMessage[];
  addMessage: (msg: Pick<ChatMessage, 'role' | 'content'>) => void;
  startStreamingMessage: () => string;
  appendToStreamingMessage: (id: string, chunk: string) => void;
  finalizeStreamingMessage: (id: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],

  addMessage: ({ role, content }) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { id: Math.random().toString(36).slice(2), role, content, timestamp: new Date() },
      ],
    })),

  startStreamingMessage: () => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({
      messages: [
        ...state.messages,
        { id, role: 'assistant', content: '', timestamp: new Date(), streaming: true },
      ],
    }));
    return id;
  },

  appendToStreamingMessage: (id, chunk) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, content: m.content + chunk } : m
      ),
    })),

  finalizeStreamingMessage: (id) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, streaming: false } : m
      ),
    })),

  clearMessages: () => set({ messages: [] }),
}));
