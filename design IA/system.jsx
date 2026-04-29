// MindLog — Sistema de diseño visual (canvas card)

function SystemCard() {
  const swatches = [
    { name: 'Fondo principal', hex: '#FAF8F4', tone: 'bg' },
    { name: 'Fondo secundario', hex: '#F0EDE7', tone: 'bg' },
    { name: 'Texto primario', hex: '#2C2520', tone: 'ink' },
    { name: 'Texto secundario', hex: '#8A7E76', tone: 'ink' },
    { name: 'Acento — tinta', hex: '#8B6F47', tone: 'accent' },
    { name: 'Acento — IA', hex: '#5C7A6E', tone: 'accent' },
    { name: 'Borde sutil', hex: '#E8E3DC', tone: 'border' },
    { name: 'Alerta', hex: '#C4714A', tone: 'warn' },
  ];

  return (
    <div style={{ width: 920, padding: '40px 48px', background: M.bg, fontFamily: M.sans, color: M.ink }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, color: M.ink2, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 8 }}>
          MindLog · sistema visual
        </div>
        <div style={{ fontFamily: M.serif, fontSize: 38, fontWeight: 500, letterSpacing: -0.6, lineHeight: 1.1, color: M.ink }}>
          Un cuaderno, no un dashboard.
        </div>
        <div style={{ fontFamily: M.serif, fontSize: 17, color: M.ink2, fontStyle: 'italic', marginTop: 10, maxWidth: 620, lineHeight: 1.5 }}>
          Tipografía con cuerpo. Crema cálido en lugar de blanco. Sin sombras —
          solo bordes 0.5px. La IA habla en verde apagado, el usuario en tinta marrón.
        </div>
      </div>

      {/* Paleta */}
      <Block title="Paleta">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {swatches.map(s => (
            <div key={s.hex} style={{ background: M.card, border: `0.5px solid ${M.border}`, borderRadius: 14, padding: 12 }}>
              <div style={{ height: 60, borderRadius: 10, background: s.hex, border: `0.5px solid ${M.border}`, marginBottom: 10 }}/>
              <div style={{ fontSize: 13, color: M.ink, fontWeight: 500 }}>{s.name}</div>
              <div style={{ fontSize: 11, color: M.ink2, letterSpacing: 0.5, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{s.hex}</div>
            </div>
          ))}
        </div>
      </Block>

      {/* Emociones */}
      <Block title="Emociones · color + label, sin emojis">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {Object.keys(M.emo).map(k => (
            <div key={k} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: M.card, border: `0.5px solid ${M.border}`,
              borderRadius: 999, padding: '10px 18px 10px 14px',
            }}>
              <span style={{ width: 12, height: 12, borderRadius: 6, background: M.emo[k].c }}/>
              <span style={{ fontSize: 13, color: M.ink }}>{M.emo[k].label}</span>
              <span style={{ fontSize: 11, color: M.ink3, fontVariantNumeric: 'tabular-nums' }}>{M.emo[k].c}</span>
            </div>
          ))}
        </div>
      </Block>

      {/* Tipografía */}
      <Block title="Tipografía · Lora (diario) + Inter (UI)">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ background: M.card, border: `0.5px solid ${M.border}`, borderRadius: 14, padding: 24 }}>
            <Spec label="Título · Lora 24/29 medium" sample="¿Qué pasó hoy?" font={M.serif} size={24} weight={500}/>
            <Spec label="Subtítulo · Lora 17/26 medium" sample="Conversación con Mara" font={M.serif} size={17} weight={500}/>
            <Spec label="Cuerpo · Lora 16/27 regular" sample="Hablamos largo después de cenar." font={M.serif} size={16}/>
          </div>
          <div style={{ background: M.card, border: `0.5px solid ${M.border}`, borderRadius: 14, padding: 24 }}>
            <Spec label="UI · Inter 15 medium" sample="Guardar resumen" font={M.sans} size={15} weight={500}/>
            <Spec label="Label · Inter 13 / lowercase / +0.4" sample="esta semana" font={M.sans} size={13} tt="lowercase" ls={0.4}/>
            <Spec label="Caption · Inter 12 medium" sample="hoy · martes 21:30" font={M.sans} size={12} weight={500} c={M.ink2}/>
          </div>
        </div>
      </Block>

      {/* Componentes */}
      <Block title="Componentes base">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Botón primario */}
          <Comp label="Botón primario · r12">
            <button style={{
              padding: '12px 22px', border: 'none', borderRadius: 12, background: M.brown, color: '#fff',
              fontFamily: M.sans, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>Guardar</button>
          </Comp>
          {/* Botón secundario */}
          <Comp label="Botón secundario">
            <button style={{
              padding: '12px 22px', borderRadius: 12, background: 'transparent',
              border: `0.5px solid ${M.border}`, fontFamily: M.sans, fontSize: 14, color: M.ink2, cursor: 'pointer',
            }}>Descartar</button>
          </Comp>
          {/* Chip */}
          <Comp label="Chip de sugerencia">
            <button style={{
              padding: '10px 16px', borderRadius: 999, background: M.card,
              border: `0.5px solid ${M.border}`, fontFamily: M.sans, fontSize: 13, color: M.ink, cursor: 'pointer',
            }}>¿Cómo estuve esta semana?</button>
          </Comp>
          {/* FAB */}
          <Comp label="FAB · 56 · acento marrón">
            <div style={{
              width: 56, height: 56, borderRadius: 28, background: M.brown,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(139,111,71,.32), 0 2px 4px rgba(139,111,71,.18)',
            }}>{Icon.plus(24)}</div>
          </Comp>
          {/* Burbuja usuario */}
          <Comp label="Burbuja · usuario">
            <div style={{
              padding: '12px 16px', borderRadius: 20, borderBottomRightRadius: 6,
              background: M.brown, color: '#fff', fontFamily: M.sans, fontSize: 14, maxWidth: 220,
            }}>¿Qué pasó la semana del 14?</div>
          </Comp>
          {/* Burbuja IA */}
          <Comp label="Burbuja · IA">
            <div style={{
              padding: '12px 16px', borderRadius: 20, borderBottomLeftRadius: 6,
              background: M.green, color: M.greenTint, fontFamily: M.serif, fontSize: 14, lineHeight: 1.5, maxWidth: 240,
            }}>Volviste a hablar de Mara tres veces esa semana.</div>
          </Comp>
        </div>
      </Block>

      <Block title="Iconos · Phosphor regular · 1.5px">
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            ['home', Icon.home(24, M.ink)],
            ['pencil', Icon.pencil(24, M.ink)],
            ['chat', Icon.chat(24, M.ink)],
            ['user', Icon.user(24, M.ink)],
            ['archive', Icon.archive(22, M.ink)],
            ['smile', Icon.smile(24, M.ink)],
            ['ai-mark', Icon.aiMark(20, M.green)],
          ].map(([n, el]) => (
            <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: M.card, border: `0.5px solid ${M.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{el}</div>
              <span style={{ fontSize: 11, color: M.ink2 }}>{n}</span>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Esquinas · sombras">
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end' }}>
          {[12, 16, 20, 24].map(r => (
            <div key={r} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 80, height: 80, borderRadius: r, background: M.card, border: `0.5px solid ${M.border}` }}/>
              <span style={{ fontSize: 11, color: M.ink2 }}>r{r}</span>
            </div>
          ))}
          <div style={{ marginLeft: 24, fontFamily: M.serif, fontSize: 14, color: M.ink2, fontStyle: 'italic', maxWidth: 220, lineHeight: 1.5 }}>
            Sin sombras. Solo borde 0.5px en {M.border}. Tarjetas r20, botones r12.
          </div>
        </div>
      </Block>
    </div>
  );
}

function Block({ title, children }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ fontSize: 11, color: M.ink2, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 14, fontWeight: 500 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Spec({ label, sample, font, size, weight = 400, tt, ls, c = M.ink }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10, color: M.ink3, letterSpacing: 0.4, marginBottom: 6, fontFamily: M.sans }}>{label}</div>
      <div style={{
        fontFamily: font, fontSize: size, fontWeight: weight, color: c,
        textTransform: tt, letterSpacing: ls, lineHeight: 1.4,
      }}>{sample}</div>
    </div>
  );
}

function Comp({ label, children }) {
  return (
    <div style={{ background: M.bg2, borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ fontSize: 10, color: M.ink2, letterSpacing: 0.5, textTransform: 'uppercase', fontFamily: M.sans }}>{label}</div>
      {children}
    </div>
  );
}

Object.assign(window, { SystemCard });
