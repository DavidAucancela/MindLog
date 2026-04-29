import { create } from 'zustand';

export interface Entry {
  id: string;
  content: string;
  mood?: string;
  created_at: string;
}

interface EntriesState {
  entries: Entry[];
  setEntries: (entries: Entry[]) => void;
  addEntry: (entry: Entry) => void;
  removeEntry: (id: string) => void;
}

export const useEntriesStore = create<EntriesState>((set) => ({
  entries: [],
  setEntries: (entries) => set({ entries }),
  addEntry: (entry) => set((state) => ({ entries: [entry, ...state.entries] })),
  removeEntry: (id) =>
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
}));
