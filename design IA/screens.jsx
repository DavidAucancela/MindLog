// MindLog — pantallas individuales como componentes puros.
// Cada Screen recibe { go, state, setState } y renderiza su contenido
// dentro del marco MindFrame.

// ─────────────────────────────────────────────────────────────
// Datos seed (sin emojis — emoción = color + label)
// ─────────────────────────────────────────────────────────────
const SEED_ENTRIES = [
  { id: 'e1', date: 'hoy · martes 21:30', dateShort: 'hoy', emo: 'pensativo',
    title: 'Conversación con Mara',
    body: 'Hablamos largo después de cenar. Me dijo algo que se quedó dándome vueltas — que a veces escucho con la cabeza ya formando una respuesta.' },
  { id: 'e2', date: 'ayer · lunes 23:02', dateShort: 'ayer', emo: 'inquieto',
    title: 'No pude dormir',
    body: 'La presentación del jueves se metió en la cama conmigo. Conté tres veces los argumentos, como si repasarlos los volviera más sólidos.' },
  { id: 'e3', date: 'sábado 18 · 22:40', dateShort: 'sáb 18', emo: 'grato',
    title: 'Caminata sin rumbo',
    body: 'Salí con la idea de comprar algo y terminé sentado en la plaza una hora. Hacía meses que no me dejaba estar así.' },
  { id: 'e4', date: 'viernes 17 · 23:15', dateShort: 'vie 17', emo: 'enfocado',
    title: 'Terminé el capítulo',
    body: 'Tres horas seguidas, sin chequear nada. Cuando levanté la cabeza era de noche y tenía hambre. Buena señal.' },
  { id: 'e5', date: 'jueves 16 · 22:00', dateShort: 'jue 16', emo: 'calmo',
    title: '—',
    body: 'Día sin nada que reportar. Y eso, hoy, también cuenta.' },
];

const SUGGESTIONS = [
  '¿Cómo estuve esta semana?',
  '¿Qué me preocupa últimamente?',
  '¿De qué hablo más en mis entradas?',
  'Léeme algo de hace un mes',
];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function EmoDot({ emo, size = 8 }) {
  const e = M.emo[emo];
  return <span style={{ width: size, height: size, borderRadius: size, background: e.c, display: 'inline-block', flexShrink: 0 }}/>;
}
function EmoBadge({ emo }) {
  const e = M.emo[emo];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: M.sans, fontSize: 12, color: M.ink2,
      letterSpacing: 0.2, textTransform: 'lowercase',
    }}>
      <EmoDot emo={emo}/>
      {e.label}
    </span>
  );
}

function FAB({ onClick, icon, color = M.brown }) {
  return (
    <button onClick={onClick} style={{
      position: 'absolute', right: 22, bottom: 96, width: 56, height: 56,
      borderRadius: 28, border: 'none', background: color, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 8px 20px rgba(139,111,71,.32), 0 2px 4px rgba(139,111,71,.18)',
      zIndex: 30,
    }}>
      {icon || Icon.plus(24)}
    </button>
  );
}

function BottomBar({ active = 'home', onNav }) {
  const Item = ({ id, label, icon }) => {
    const isActive = active === id;
    const c = isActive ? M.ink : M.ink3;
    return (
      <button onClick={() => onNav && onNav(id)} style={{
        flex: 1, border: 'none', background: 'transparent', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        padding: '8px 0',
      }}>
        {icon(22, c)}
        <span style={{ fontFamily: M.sans, fontSize: 10, fontWeight: 500, color: c, letterSpacing: 0.3 }}>{label}</span>
      </button>
    );
  };
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: 28,
      paddingTop: 8, background: M.bg,
      borderTop: `0.5px solid ${M.border}`,
      display: 'flex', zIndex: 20,
    }}>
      <Item id="home" label="Inicio" icon={Icon.home}/>
      <Item id="new" label="Escribir" icon={Icon.pencil}/>
      <Item id="chat" label="Diario" icon={Icon.chat}/>
      <Item id="profile" label="Tú" icon={Icon.user}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 1: HOME
// ─────────────────────────────────────────────────────────────
function HomeScreen({ go, state }) {
  const entries = (state && state.entries) || SEED_ENTRIES;
  const empty = state && state.empty;

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <div style={{ height: '100%', overflow: 'auto', paddingTop: 60, paddingBottom: 120 }}>
        {/* Header — saludo */}
        <div style={{ padding: '20px 24px 24px' }}>
          <div style={{
            fontFamily: M.sans, fontSize: 13, color: M.ink2,
            letterSpacing: 0.4, textTransform: 'lowercase', marginBottom: 6,
          }}>martes, 21 de abril</div>
          <div style={{
            fontFamily: M.serif, fontSize: 28, color: M.ink,
            lineHeight: 1.15, letterSpacing: -0.3, fontWeight: 500,
          }}>
            Buenas noches,<br/>
            <span style={{ fontStyle: 'italic', color: M.brown }}>David.</span>
          </div>
        </div>

        {empty ? (
          <div style={{ padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, margin: '0 auto 24px', borderRadius: 32,
              background: M.brownTint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {Icon.pencil(28, M.brown)}
            </div>
            <div style={{ fontFamily: M.serif, fontSize: 20, color: M.ink, lineHeight: 1.3, marginBottom: 8 }}>
              Tu cuaderno está en blanco.
            </div>
            <div style={{ fontFamily: M.sans, fontSize: 14, color: M.ink2, lineHeight: 1.5, maxWidth: 240, margin: '0 auto' }}>
              Empieza con cualquier cosa — un detalle del día, algo que pensaste mientras venías.
            </div>
          </div>
        ) : (
          <>
            {/* Sección hoy */}
            <SectionLabel>esta semana</SectionLabel>
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {entries.slice(0, 2).map(e => (
                <EntryCard key={e.id} entry={e} onClick={() => go && go('detail', { entry: e })}/>
              ))}
            </div>

            <SectionLabel>antes</SectionLabel>
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {entries.slice(2).map(e => (
                <EntryCard key={e.id} entry={e} onClick={() => go && go('detail', { entry: e })}/>
              ))}
            </div>
          </>
        )}
      </div>

      <FAB onClick={() => go && go('new')}/>
      <BottomBar active="home" onNav={(id) => {
        if (id === 'new') go && go('new');
        if (id === 'chat') go && go('chat');
      }}/>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      padding: '20px 24px 10px', fontFamily: M.sans, fontSize: 12,
      color: M.ink2, textTransform: 'lowercase', letterSpacing: 1.2, fontWeight: 500,
    }}>{children}</div>
  );
}

function EntryCard({ entry, onClick }) {
  return (
    <button onClick={onClick} style={{
      textAlign: 'left', cursor: 'pointer',
      background: M.card, border: `0.5px solid ${M.border}`,
      borderRadius: M.rCard, padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 10,
      width: '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontFamily: M.sans, fontSize: 12, color: M.ink2,
          letterSpacing: 0.3, textTransform: 'lowercase', fontWeight: 500,
        }}>{entry.date}</span>
        <EmoBadge emo={entry.emo}/>
      </div>
      {entry.title && entry.title !== '—' && (
        <div style={{ fontFamily: M.serif, fontSize: 17, fontWeight: 500, color: M.ink, letterSpacing: -0.2 }}>
          {entry.title}
        </div>
      )}
      <div style={{
        fontFamily: M.serif, fontSize: 15, color: M.ink2, lineHeight: 1.5,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>{entry.body}</div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 2: NUEVA ENTRADA
// ─────────────────────────────────────────────────────────────
function NewEntryScreen({ go, state, setState }) {
  const text = (state && state.draft) || '';
  const emo = (state && state.draftEmo) || null;
  const [showEmo, setShowEmo] = React.useState(false);

  const onText = (e) => setState && setState(s => ({ ...s, draft: e.target.value }));
  const onSave = () => {
    if (!text.trim()) { go && go('home'); return; }
    setState && setState(s => {
      const newEntry = {
        id: 'n' + Date.now(), date: 'hoy · martes 22:14', dateShort: 'hoy',
        emo: emo || 'pensativo', title: text.split('\n')[0].slice(0, 40),
        body: text,
      };
      return { ...s, entries: [newEntry, ...(s.entries || SEED_ENTRIES)], draft: '', draftEmo: null };
    });
    go && go('home');
  };

  return (
    <div style={{ height: '100%', position: 'relative', background: M.bg }}>
      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 56, left: 0, right: 0, height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', zIndex: 10,
      }}>
        <button onClick={() => go && go('home')} style={{
          width: 36, height: 36, borderRadius: 18, border: 'none',
          background: 'transparent', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{Icon.arrowLeft(20, M.ink2)}</button>
        <div style={{
          fontFamily: M.sans, fontSize: 12, color: M.ink2,
          letterSpacing: 0.4, textTransform: 'lowercase',
        }}>martes, 21 de abril · 22:14</div>
        <button onClick={onSave} style={{
          padding: '8px 14px', borderRadius: 12, border: 'none',
          background: text.trim() ? M.brown : 'transparent',
          color: text.trim() ? '#fff' : M.ink3,
          fontFamily: M.sans, fontSize: 14, fontWeight: 600,
          cursor: 'pointer',
        }}>Guardar</button>
      </div>

      {/* Línea de margen sutil — referencia a cuaderno */}
      <div style={{
        position: 'absolute', top: 108, bottom: 280, left: 56, width: 0.5,
        background: M.border, zIndex: 1,
      }}/>

      {/* Campo de escritura */}
      <div style={{ position: 'absolute', top: 116, left: 0, right: 0, bottom: 280, padding: '8px 24px 0 72px' }}>
        <textarea
          autoFocus
          value={text}
          onChange={onText}
          placeholder="¿Qué pasó hoy?"
          style={{
            width: '100%', height: '100%', border: 'none', outline: 'none',
            background: 'transparent', resize: 'none',
            fontFamily: M.serif, fontSize: 18, lineHeight: 1.7, color: M.ink,
            letterSpacing: -0.1,
          }}
        />
      </div>

      {/* Mood selector */}
      {showEmo && (
        <div style={{
          position: 'absolute', bottom: 280, left: 16, right: 16,
          background: M.card, border: `0.5px solid ${M.border}`, borderRadius: M.rCard,
          padding: 16, zIndex: 15,
        }}>
          <div style={{ fontFamily: M.sans, fontSize: 12, color: M.ink2, marginBottom: 14, textTransform: 'lowercase', letterSpacing: 0.4 }}>
            ¿cómo te sentís?
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.keys(M.emo).map(k => (
              <button key={k} onClick={() => { setState && setState(s => ({ ...s, draftEmo: k })); setShowEmo(false); }} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', borderRadius: M.rChip,
                border: `0.5px solid ${emo === k ? M.brown : M.border}`,
                background: emo === k ? M.brownTint : M.card,
                cursor: 'pointer',
                fontFamily: M.sans, fontSize: 13, color: M.ink,
              }}>
                <EmoDot emo={k} size={10}/>{M.emo[k].label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar mood */}
      <div style={{
        position: 'absolute', bottom: 240, left: 16, zIndex: 12,
      }}>
        <button onClick={() => setShowEmo(s => !s)} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px 8px 10px', borderRadius: M.rChip,
          border: `0.5px solid ${M.border}`, background: M.card, cursor: 'pointer',
          fontFamily: M.sans, fontSize: 13, color: emo ? M.ink : M.ink2,
        }}>
          {emo
            ? <><EmoDot emo={emo} size={10}/>{M.emo[emo].label}</>
            : <>{Icon.smile(16, M.ink2)} estado de ánimo</>
          }
        </button>
      </div>

      {/* Teclado nativo */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 5 }}>
        <IOSKeyboard/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 3: CHAT IA
// ─────────────────────────────────────────────────────────────
function ChatScreen({ go, state, setState }) {
  const messages = (state && state.chat) || [];
  const [input, setInput] = React.useState('');
  const [thinking, setThinking] = React.useState(false);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length, thinking]);

  const send = async (text) => {
    const t = (text || input).trim();
    if (!t || thinking) return;
    const userMsg = { id: 'u' + Date.now(), role: 'user', text: t };
    setState && setState(s => ({ ...s, chat: [...(s.chat || []), userMsg] }));
    setInput('');
    setThinking(true);

    try {
      const ctx = (state && state.entries || SEED_ENTRIES)
        .map(e => `[${e.date}] (${M.emo[e.emo].label}) ${e.title}: ${e.body}`).join('\n');
      const res = await window.claude.complete({
        messages: [{
          role: 'user',
          content: `Sos el diario íntimo de David. Tono cálido, sereno, breve (2-4 frases). Hablás en español rioplatense, sin emojis, sin listas, sin negritas. No sos un asistente — sos su archivo. Respondé como si fueras un confidente reflexivo, no un terapeuta.

Sus entradas recientes:
${ctx}

Pregunta: ${t}`
        }]
      });
      setState && setState(s => ({ ...s, chat: [...(s.chat || []), { id: 'a' + Date.now(), role: 'ai', text: res }] }));
    } catch (err) {
      setState && setState(s => ({ ...s, chat: [...(s.chat || []), {
        id: 'a' + Date.now(), role: 'ai',
        text: 'Releí lo que escribiste estos días. Esta semana volviste varias veces a la idea de escuchar — quizás algo ahí te está pidiendo atención.'
      }] }));
    }
    setThinking(false);
  };

  return (
    <div style={{ height: '100%', position: 'relative', background: M.bg }}>
      {/* Header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 56,
        background: M.bg, borderBottom: `0.5px solid ${M.border}`, zIndex: 10,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 16px 14px',
        }}>
          <button onClick={() => go && go('home')} style={{
            width: 36, height: 36, borderRadius: 18, border: 'none',
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{Icon.arrowLeft(20, M.ink2)}</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {Icon.archive(18, M.ink)}
            <div style={{ fontFamily: M.serif, fontSize: 17, color: M.ink, fontWeight: 500, letterSpacing: -0.2 }}>
              Tu diario
            </div>
          </div>
          <div style={{ width: 36 }}/>
        </div>
      </div>

      {/* Mensajes */}
      <div ref={scrollRef} style={{
        position: 'absolute', top: 110, bottom: 76, left: 0, right: 0,
        overflow: 'auto', padding: '20px 16px 8px',
      }}>
        {messages.length === 0 ? (
          <div>
            <div style={{
              padding: '20px 8px 28px',
              fontFamily: M.serif, fontSize: 17, color: M.ink2,
              lineHeight: 1.5, fontStyle: 'italic',
            }}>
              Llevo conmigo todo lo que escribiste.<br/>Preguntame algo.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 4px' }}>
              {SUGGESTIONS.map(q => (
                <button key={q} onClick={() => send(q)} style={{
                  textAlign: 'left', padding: '14px 18px',
                  borderRadius: M.rCard, border: `0.5px solid ${M.border}`,
                  background: M.card, cursor: 'pointer',
                  fontFamily: M.sans, fontSize: 14, color: M.ink, fontWeight: 400,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span>{q}</span>
                  <span style={{ color: M.green, opacity: .6, fontSize: 18 }}>›</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map(m => <Bubble key={m.id} m={m}/>)}
            {thinking && <ThinkingBubble/>}
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        position: 'absolute', bottom: 34, left: 0, right: 0,
        padding: '10px 14px', background: M.bg,
        borderTop: `0.5px solid ${M.border}`, zIndex: 10,
      }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 8,
          background: M.card, borderRadius: 22, border: `0.5px solid ${M.border}`,
          padding: '6px 6px 6px 16px',
        }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Preguntame algo sobre tus entradas..."
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: M.sans, fontSize: 15, color: M.ink,
              padding: '8px 0',
            }}
          />
          <button onClick={() => send()} disabled={!input.trim()} style={{
            width: 34, height: 34, borderRadius: 17, border: 'none',
            background: input.trim() ? M.green : M.bg2, cursor: input.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{Icon.send(16, input.trim() ? '#fff' : M.ink3)}</button>
        </div>
      </div>
    </div>
  );
}

function Bubble({ m }) {
  const isUser = m.role === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 6 }}>
      {!isUser && (
        <div style={{
          width: 24, height: 24, borderRadius: 12, background: M.greenTint,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          marginBottom: 2,
        }}>{Icon.aiMark(12, M.green)}</div>
      )}
      <div style={{
        maxWidth: '78%',
        padding: '12px 16px',
        borderRadius: 20,
        background: isUser ? M.brown : M.green,
        color: isUser ? '#fff' : M.greenTint,
        fontFamily: isUser ? M.sans : M.serif,
        fontSize: isUser ? 15 : 15,
        lineHeight: 1.5,
        letterSpacing: isUser ? 0 : -0.1,
        borderBottomRightRadius: isUser ? 6 : 20,
        borderBottomLeftRadius: isUser ? 20 : 6,
      }}>
        {m.text}
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
      <div style={{
        width: 24, height: 24, borderRadius: 12, background: M.greenTint,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: 2,
      }}>{Icon.aiMark(12, M.green)}</div>
      <div style={{
        padding: '14px 18px', borderRadius: 20, borderBottomLeftRadius: 6,
        background: M.green, display: 'flex', gap: 4,
      }}>
        {[0,1,2].map(i => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: 3, background: '#fff', opacity: .6,
            animation: `mind-pulse 1.2s ${i * 0.15}s infinite`,
          }}/>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 4: RESUMEN DIARIO (overlay/modal)
// ─────────────────────────────────────────────────────────────
function SummaryOverlay({ go, dismiss }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(44,37,32,.55)',
      display: 'flex', alignItems: 'flex-end',
      animation: 'mind-fade .25s ease',
    }}>
      <div style={{
        width: '100%', background: M.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '12px 24px 40px', position: 'relative',
        animation: 'mind-slideup .35s cubic-bezier(.2,.8,.2,1)',
      }}>
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: M.border, margin: '0 auto 24px' }}/>

        {/* Label */}
        <div style={{
          fontFamily: M.sans, fontSize: 12, color: M.ink2, textTransform: 'lowercase',
          letterSpacing: 1.2, marginBottom: 14,
        }}>resumen del lunes</div>

        {/* Emoción dominante */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <div style={{ width: 44, height: 44, borderRadius: 22, background: M.emo.inquieto.c, opacity: .9 }}/>
          <div>
            <div style={{ fontFamily: M.sans, fontSize: 11, color: M.ink2, letterSpacing: 0.4, textTransform: 'lowercase' }}>
              tono dominante
            </div>
            <div style={{ fontFamily: M.serif, fontSize: 22, color: M.ink, fontWeight: 500, letterSpacing: -0.3 }}>
              inquieto
            </div>
          </div>
        </div>

        {/* Texto del resumen */}
        <div style={{
          fontFamily: M.serif, fontSize: 17, lineHeight: 1.6, color: M.ink,
          letterSpacing: -0.1, marginBottom: 20,
        }}>
          Ayer escribiste poco pero con peso. Volvió la presentación del jueves — no como tarea, como una imagen que no se va. <span style={{ color: M.ink2, fontStyle: 'italic' }}>"Como si repasarlos los volviera más sólidos"</span>, dijiste.
        </div>

        {/* Pregunta reflexiva */}
        <div style={{
          background: M.greenTint, borderRadius: 16, padding: '16px 18px',
          marginBottom: 28, position: 'relative', paddingLeft: 44,
        }}>
          <div style={{ position: 'absolute', left: 16, top: 18 }}>{Icon.aiMark(14, M.green)}</div>
          <div style={{ fontFamily: M.sans, fontSize: 11, color: M.green, letterSpacing: 0.4, textTransform: 'lowercase', marginBottom: 4, fontWeight: 600 }}>
            para hoy
          </div>
          <div style={{ fontFamily: M.serif, fontSize: 16, color: M.greenDark, lineHeight: 1.5, letterSpacing: -0.1 }}>
            ¿Qué de esa presentación te importa tanto que no se calla?
          </div>
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={dismiss} style={{
            flex: 1, padding: '14px 0', borderRadius: M.rBtn,
            border: `0.5px solid ${M.border}`, background: 'transparent',
            fontFamily: M.sans, fontSize: 14, fontWeight: 500, color: M.ink2, cursor: 'pointer',
          }}>Descartar</button>
          <button onClick={dismiss} style={{
            flex: 1.4, padding: '14px 0', borderRadius: M.rBtn,
            border: 'none', background: M.brown, color: '#fff',
            fontFamily: M.sans, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>{Icon.check(16)} Guardar resumen</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 5: DETALLE DE ENTRADA (extra útil)
// ─────────────────────────────────────────────────────────────
function DetailScreen({ go, state }) {
  const entry = (state && state.detailEntry) || SEED_ENTRIES[0];
  return (
    <div style={{ height: '100%', position: 'relative', background: M.bg }}>
      <div style={{
        position: 'absolute', top: 56, left: 0, right: 0, height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', zIndex: 10,
      }}>
        <button onClick={() => go && go('home')} style={{
          width: 36, height: 36, borderRadius: 18, border: 'none',
          background: 'transparent', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{Icon.arrowLeft(20, M.ink2)}</button>
        <button style={{
          width: 36, height: 36, borderRadius: 18, border: 'none',
          background: 'transparent', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{Icon.more(20)}</button>
      </div>

      <div style={{
        position: 'absolute', top: 108, left: 0, right: 0, bottom: 0,
        overflow: 'auto', padding: '16px 28px 60px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontFamily: M.sans, fontSize: 12, color: M.ink2, letterSpacing: 0.4, textTransform: 'lowercase' }}>
            {entry.date}
          </span>
          <span style={{ color: M.ink3 }}>·</span>
          <EmoBadge emo={entry.emo}/>
        </div>
        {entry.title && entry.title !== '—' && (
          <div style={{ fontFamily: M.serif, fontSize: 26, color: M.ink, fontWeight: 500, lineHeight: 1.2, letterSpacing: -0.4, marginBottom: 18 }}>
            {entry.title}
          </div>
        )}
        <div style={{ fontFamily: M.serif, fontSize: 17, lineHeight: 1.7, color: M.ink, letterSpacing: -0.1, whiteSpace: 'pre-wrap' }}>
          {entry.body}
        </div>

        {/* Reflejo de la IA al final */}
        <div style={{
          marginTop: 36, padding: '16px 18px 16px 44px', background: M.greenTint,
          borderRadius: 16, position: 'relative',
        }}>
          <div style={{ position: 'absolute', left: 16, top: 18 }}>{Icon.aiMark(14, M.green)}</div>
          <div style={{ fontFamily: M.sans, fontSize: 11, color: M.green, letterSpacing: 0.4, textTransform: 'lowercase', marginBottom: 4, fontWeight: 600 }}>
            reflejo
          </div>
          <div style={{ fontFamily: M.serif, fontSize: 15, color: M.greenDark, lineHeight: 1.5, letterSpacing: -0.1 }}>
            Es la tercera vez este mes que aparece la palabra "escuchar". Algo está pidiendo lugar.
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  HomeScreen, NewEntryScreen, ChatScreen, SummaryOverlay, DetailScreen,
  EmoDot, EmoBadge, EntryCard, BottomBar, FAB, SectionLabel, Bubble, ThinkingBubble,
  SEED_ENTRIES, SUGGESTIONS,
});
