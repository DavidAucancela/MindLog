import { create } from 'zustand';
import type { Entry } from './entriesStore';

// Datos seed del diseño para previsualizar sin backend
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(21, 30, 0, 0);
  return d.toISOString();
}

export const PREVIEW_ENTRIES: Entry[] = [
  {
    id: 'e1',
    content: 'Hablamos largo después de cenar. Me dijo algo que se quedó dándome vueltas — que a veces escucho con la cabeza ya formando una respuesta.',
    mood: 'pensativo',
    created_at: daysAgo(0),
  },
  {
    id: 'e2',
    content: 'La presentación del jueves se metió en la cama conmigo. Conté tres veces los argumentos, como si repasarlos los volviera más sólidos.',
    mood: 'inquieto',
    created_at: daysAgo(1),
  },
  {
    id: 'e3',
    content: 'Salí con la idea de comprar algo y terminé sentado en la plaza una hora. Hacía meses que no me dejaba estar así.',
    mood: 'grato',
    created_at: daysAgo(3),
  },
  {
    id: 'e4',
    content: 'Tres horas seguidas, sin chequear nada. Cuando levanté la cabeza era de noche y tenía hambre. Buena señal.',
    mood: 'enfocado',
    created_at: daysAgo(4),
  },
  {
    id: 'e5',
    content: 'Día sin nada que reportar. Y eso, hoy, también cuenta.',
    mood: 'calmo',
    created_at: daysAgo(5),
  },
];

export const PREVIEW_USER = { id: 'preview', email: 'demo@mindlog.app', name: 'David' };

export const PREVIEW_CHAT_RESPONSE =
  'Releí lo que escribiste estos días. Esta semana volviste varias veces a la idea de escuchar — algo en eso te está pidiendo atención.';

interface PreviewState {
  isPreview: boolean;
  startPreview: () => void;
  stopPreview: () => void;
}

export const usePreviewStore = create<PreviewState>((set) => ({
  isPreview: false,
  startPreview: () => set({ isPreview: true }),
  stopPreview: () => set({ isPreview: false }),
}));
