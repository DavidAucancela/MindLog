// MindLog — design tokens
// Single source of truth: colors, type, components.

const M = {
  // Surfaces
  bg: '#FAF8F4',         // crema cálido
  bg2: '#F0EDE7',        // secundario
  card: '#FFFFFF',
  border: '#E8E3DC',     // sutil

  // Ink
  ink: '#2C2520',        // primario
  ink2: '#8A7E76',       // secundario
  ink3: '#B5A89D',       // terciario / hint

  // Accents
  brown: '#8B6F47',      // tinta sobre papel
  brownDark: '#6E5635',
  brownTint: '#F2EBE0',
  green: '#5C7A6E',      // IA
  greenDark: '#445C53',
  greenTint: '#E8EEEA',
  warn: '#C4714A',

  // Emoción → solo color + label (sin emojis)
  emo: {
    calmo:    { c: '#A8B5A0', label: 'calmo' },
    inquieto: { c: '#C4714A', label: 'inquieto' },
    pensativo:{ c: '#8B6F47', label: 'pensativo' },
    grato:    { c: '#D4A65A', label: 'grato' },
    triste:   { c: '#7A8FA0', label: 'triste' },
    enfocado: { c: '#5C7A6E', label: 'enfocado' },
  },

  // Type
  serif: '"Lora", Georgia, "Times New Roman", serif',
  sans:  '"Inter", -apple-system, system-ui, sans-serif',

  // Radii
  rCard: 20,
  rBtn: 12,
  rChip: 999,
};

// Phosphor-style line icons (1.5px stroke)
const Icon = {
  pencil: (s = 22, c = M.ink) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 3.5l4 4-12 12H4.5v-4z"/><path d="M14 6l4 4"/>
    </svg>
  ),
  home: (s = 22, c = M.ink) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1z"/>
    </svg>
  ),
  chat: (s = 22, c = M.ink) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5h16v11H8.5L4 19.5z"/>
    </svg>
  ),
  user: (s = 22, c = M.ink) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6"/>
    </svg>
  ),
  plus: (s = 22, c = '#fff') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  ),
  arrowLeft: (s = 20, c = M.ink) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 5l-7 7 7 7"/>
    </svg>
  ),
  archive: (s = 18, c = M.ink) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8"/><path d="M10 12h4"/>
    </svg>
  ),
  send: (s = 18, c = '#fff') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l15-8-5 16-4-7z"/><path d="M11 13l4-5"/>
    </svg>
  ),
  more: (s = 20, c = M.ink2) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
      <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
    </svg>
  ),
  smile: (s = 22, c = M.ink2) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><path d="M8 14c1 1.5 2.5 2.5 4 2.5s3-1 4-2.5"/><circle cx="9" cy="10" r=".8" fill={c}/><circle cx="15" cy="10" r=".8" fill={c}/>
    </svg>
  ),
  check: (s = 18, c = '#fff') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5 9-11"/>
    </svg>
  ),
  // Mark de la IA — punto lleno con halo (luna/tinta)
  aiMark: (s = 14, c = M.green) => (
    <svg width={s} height={s} viewBox="0 0 14 14">
      <circle cx="7" cy="7" r="6.5" fill="none" stroke={c} strokeOpacity=".3" strokeWidth="1"/>
      <circle cx="7" cy="7" r="3.2" fill={c}/>
    </svg>
  ),
};

// Status bar simple en color de tinta sobre crema
function MindStatusBar({ time = '22:14' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 32px 8px', position: 'absolute', top: 0, left: 0, right: 0,
      zIndex: 10, fontFamily: M.sans, color: M.ink, fontWeight: 600, fontSize: 16,
    }}>
      <div>{time}</div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="18" height="11" viewBox="0 0 18 11" fill={M.ink}>
          <rect x="0" y="7" width="3" height="4" rx="0.5"/>
          <rect x="5" y="5" width="3" height="6" rx="0.5"/>
          <rect x="10" y="2.5" width="3" height="8.5" rx="0.5"/>
          <rect x="15" y="0" width="3" height="11" rx="0.5"/>
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12">
          <rect x="0.5" y="0.5" width="22" height="11" rx="3" fill="none" stroke={M.ink} strokeOpacity=".5"/>
          <rect x="2" y="2" width="19" height="8" rx="1.5" fill={M.ink}/>
          <path d="M23.5 4v4c.7-.3 1-1 1-2s-.3-1.7-1-2z" fill={M.ink} fillOpacity=".5"/>
        </svg>
      </div>
    </div>
  );
}

function HomeIndicator({ light = false }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 34,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 8,
      pointerEvents: 'none', zIndex: 60,
    }}>
      <div style={{ width: 134, height: 5, borderRadius: 100, background: light ? 'rgba(255,255,255,.7)' : 'rgba(44,37,32,.3)' }}/>
    </div>
  );
}

// Marco básico MindLog (no usa el iOSDevice del starter para tener bezel cálido custom)
function MindFrame({ children, width = 393, height = 852, time = '22:14', showStatus = true, bg = M.bg, dynIsland = true }) {
  return (
    <div style={{
      width, height, borderRadius: 47, overflow: 'hidden', position: 'relative',
      background: bg,
      boxShadow: '0 30px 60px rgba(44,37,32,.18), 0 0 0 1px rgba(44,37,32,.12)',
      fontFamily: M.sans, WebkitFontSmoothing: 'antialiased',
    }}>
      {dynIsland && (
        <div style={{
          position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
          width: 124, height: 36, borderRadius: 22, background: '#000', zIndex: 50,
        }}/>
      )}
      {showStatus && <MindStatusBar time={time}/>}
      <div style={{ position: 'absolute', inset: 0, paddingTop: 0 }}>
        {children}
      </div>
      <HomeIndicator/>
    </div>
  );
}

Object.assign(window, { M, Icon, MindFrame, MindStatusBar, HomeIndicator });
