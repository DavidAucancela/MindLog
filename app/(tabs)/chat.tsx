import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useChatStore, type ChatMessage } from '@/store/chatStore';
import { T } from '@/constants/theme';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

const SUGGESTIONS = [
  '¿Cómo estuve esta semana?',
  '¿Qué me preocupa últimamente?',
  '¿De qué hablo más en mis entradas?',
  'Léeme algo de hace un mes',
];

function AIMark() {
  return (
    <View style={styles.aiMark}>
      <View style={styles.aiMarkInner} />
    </View>
  );
}

function AiAvatar() {
  return (
    <View style={styles.aiAvatar}>
      <AIMark />
    </View>
  );
}

function ThinkingBubble() {
  return (
    <View style={styles.bubbleRow}>
      <AiAvatar />
      <View style={[styles.bubble, styles.aiBubble, { paddingVertical: 18 }]}>
        <View style={{ flexDirection: 'row', gap: 5 }}>
          {[0, 1, 2].map(i => (
            <View key={i} style={styles.thinkingDot} />
          ))}
        </View>
      </View>
    </View>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
      {!isUser && <AiAvatar />}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.bubbleText, isUser ? styles.userText : styles.aiText]}>
          {message.content}
          {message.streaming ? <Text style={styles.cursor}>▍</Text> : null}
        </Text>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const { token } = useAuthStore();
  const { messages, addMessage, startStreamingMessage, appendToStreamingMessage, finalizeStreamingMessage, clearMessages } = useChatStore();
  const listRef = useRef<FlatList>(null);
  const streamingIdRef = useRef<string | null>(null);

  function handleSend(text?: string) {
    const question = (text ?? input).trim();
    if (!question || loading) return;

    // Capturamos el historial ANTES de agregar el nuevo mensaje
    const history = messages
      .filter(m => !m.streaming)
      .map(m => ({ role: m.role, content: m.content }));

    addMessage({ role: 'user', content: question });
    setInput('');
    setLoading(true);
    streamingIdRef.current = null;

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/chat/stream`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    let processed = 0;

    xhr.onprogress = () => {
      const newText = xhr.responseText.slice(processed);
      processed = xhr.responseText.length;

      const lines = newText.split('\n');
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') break;
        try {
          const { chunk } = JSON.parse(data);
          if (!streamingIdRef.current) {
            streamingIdRef.current = startStreamingMessage();
            setLoading(false);
          }
          appendToStreamingMessage(streamingIdRef.current, chunk);
          listRef.current?.scrollToEnd({ animated: false });
        } catch {}
      }
    };

    xhr.onload = () => {
      setLoading(false);
      if (streamingIdRef.current) {
        finalizeStreamingMessage(streamingIdRef.current);
      } else if (xhr.status === 401) {
        addMessage({ role: 'assistant', content: 'Tu sesión expiró. Cerrá sesión y volvé a entrar.' });
      } else if (xhr.status >= 400) {
        addMessage({ role: 'assistant', content: 'Hubo un error en el servidor. Intentá de nuevo en un momento.' });
      } else {
        addMessage({ role: 'assistant', content: 'No recibí respuesta. Intentá de nuevo.' });
      }
      streamingIdRef.current = null;
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    };

    xhr.onerror = () => {
      setLoading(false);
      if (streamingIdRef.current) finalizeStreamingMessage(streamingIdRef.current);
      streamingIdRef.current = null;
      addMessage({ role: 'assistant', content: 'Hubo un error de conexión.' });
    };

    xhr.send(JSON.stringify({ question, history }));
  }

  function handleClose() {
    const finishedMessages = messages.filter(m => !m.streaming);
    if (finishedMessages.length === 0) return;

    Alert.alert(
      'Cerrar conversación',
      'Se guardará un resumen de esta charla para que te recuerde mejor la próxima vez.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar y guardar',
          onPress: async () => {
            setClosing(true);
            try {
              const history = finishedMessages.map(m => ({ role: m.role, content: m.content }));
              await fetch(`${API_URL}/chat/close`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ history }),
              });
            } catch {}
            setClosing(false);
            clearMessages();
          },
        },
      ]
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {messages.length === 0 ? (
        <FlatList
          ref={listRef}
          data={SUGGESTIONS}
          keyExtractor={item => item}
          contentContainerStyle={styles.emptyList}
          ListHeaderComponent={
            <Text style={styles.emptyPrompt}>
              Llevo conmigo todo lo que escribiste.{'\n'}Preguntame algo.
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.suggestionCard} onPress={() => handleSend(item)}>
              <Text style={styles.suggestionText}>{item}</Text>
              <Text style={styles.suggestionArrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => <ChatBubble message={item} />}
          ListFooterComponent={loading ? <ThinkingBubble /> : null}
        />
      )}

      <View style={styles.inputBar}>
        {messages.length > 0 && (
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleClose}
            disabled={loading || closing}
          >
            <Text style={styles.closeBtnText}>
              {closing ? 'Guardando...' : 'Cerrar conversación'}
            </Text>
          </TouchableOpacity>
        )}
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Preguntame algo sobre tus entradas..."
            placeholderTextColor={T.ink3}
            multiline
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },

  emptyList: { padding: 16, paddingTop: 24, gap: 10 },
  emptyPrompt: {
    fontFamily: 'Lora_400Regular_Italic',
    fontSize: 17,
    color: T.ink2,
    lineHeight: 26,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  suggestionCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: T.card, borderRadius: T.rCard,
    borderWidth: 0.5, borderColor: T.border,
    paddingHorizontal: 18, paddingVertical: 14,
  },
  suggestionText: { fontSize: 14, color: T.ink, flex: 1 },
  suggestionArrow: { fontSize: 18, color: T.green, opacity: 0.6 },

  messageList: { padding: 16, gap: 12, paddingBottom: 8 },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  bubbleRowUser: { justifyContent: 'flex-end' },

  aiAvatar: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: T.greenTint,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginBottom: 2,
  },
  aiMark: {
    width: 13, height: 13, borderRadius: 6.5,
    borderWidth: 1, borderColor: T.green,
    alignItems: 'center', justifyContent: 'center',
    opacity: 0.9,
  },
  aiMarkInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.green },

  bubble: { maxWidth: '78%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  userBubble: { backgroundColor: T.brown, borderBottomRightRadius: 6 },
  aiBubble: { backgroundColor: T.green, borderBottomLeftRadius: 6 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#fff', fontFamily: 'System' },
  aiText: { color: T.greenTint, fontFamily: 'Lora_400Regular', letterSpacing: -0.1 },
  cursor: { color: T.greenTint, opacity: 0.7 },

  thinkingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.greenTint, opacity: 0.7 },

  inputBar: {
    paddingHorizontal: 14, paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    borderTopWidth: 0.5, borderTopColor: T.border,
    backgroundColor: T.bg,
    gap: 8,
  },
  closeBtn: {
    alignSelf: 'center',
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 0.5, borderColor: T.border,
  },
  closeBtnText: {
    fontSize: 12, color: T.ink2,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    backgroundColor: T.card,
    borderRadius: 22,
    borderWidth: 0.5, borderColor: T.border,
    paddingVertical: 6, paddingLeft: 16, paddingRight: 6,
  },
  input: {
    flex: 1, fontFamily: 'System', fontSize: 15, color: T.ink,
    maxHeight: 100, paddingVertical: 8,
  },
  sendBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: T.green, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: T.bg2 },
  sendIcon: { color: '#fff', fontSize: 18, fontWeight: '700', lineHeight: 22 },
});
