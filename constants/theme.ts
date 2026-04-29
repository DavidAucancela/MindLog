// MindLog — design tokens (espejo de design IA/tokens.jsx en React Native)

export const T = {
  // Surfaces
  bg: '#FAF8F4',
  bg2: '#F0EDE7',
  card: '#FFFFFF',
  border: '#E8E3DC',

  // Ink
  ink: '#2C2520',
  ink2: '#8A7E76',
  ink3: '#B5A89D',

  // Accents
  brown: '#8B6F47',
  brownDark: '#6E5635',
  brownTint: '#F2EBE0',

  // IA
  green: '#5C7A6E',
  greenDark: '#445C53',
  greenTint: '#E8EEEA',

  // Alerta
  warn: '#C4714A',

  // Emociones — color + label, sin emojis
  emo: {
    calmo:     { color: '#A8B5A0', label: 'calmo' },
    inquieto:  { color: '#C4714A', label: 'inquieto' },
    pensativo: { color: '#8B6F47', label: 'pensativo' },
    grato:     { color: '#D4A65A', label: 'grato' },
    triste:    { color: '#7A8FA0', label: 'triste' },
    enfocado:  { color: '#5C7A6E', label: 'enfocado' },
  } as Record<string, { color: string; label: string }>,

  // Radii
  rCard: 20,
  rBtn: 12,
  rChip: 999,
} as const;

// Mapeo de palabras libres del backend a claves del sistema de emoción
const EMO_MAP: Record<string, string> = {
  tranquilo: 'calmo', sereno: 'calmo', relajado: 'calmo', paz: 'calmo',
  ansioso: 'inquieto', nervioso: 'inquieto', preocupado: 'inquieto', agitado: 'inquieto',
  reflexivo: 'pensativo', meditabundo: 'pensativo', dubitativo: 'pensativo',
  agradecido: 'grato', contento: 'grato', feliz: 'grato', alegre: 'grato',
  triste: 'triste', melancólico: 'triste', apagado: 'triste',
  motivado: 'enfocado', concentrado: 'enfocado', productivo: 'enfocado', enfocado: 'enfocado',
  frustrado: 'inquieto', cansado: 'calmo', esperanzado: 'grato',
};

// Compat shim para hooks del template (ThemedText, ThemedView, useThemeColor)
export const Colors = {
  light: { text: T.ink, background: T.bg, tint: T.brown, icon: T.ink2, tabIconDefault: T.ink3, tabIconSelected: T.brown },
  dark: { text: '#F5F0E8', background: '#1A1510', tint: T.brown, icon: T.ink2, tabIconDefault: T.ink3, tabIconSelected: T.brown },
} as const;

export function resolveEmo(raw: string | undefined): { color: string; label: string } | null {
  if (!raw) return null;
  const key = raw.toLowerCase().trim();
  const resolved = EMO_MAP[key] ?? key;
  return T.emo[resolved] ?? null;
}
