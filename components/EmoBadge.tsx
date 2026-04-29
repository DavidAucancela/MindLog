import { View, Text, StyleSheet } from 'react-native';
import { resolveEmo } from '@/constants/theme';
import { T } from '@/constants/theme';

interface Props {
  mood?: string;
  size?: 'sm' | 'md';
}

export function EmoBadge({ mood, size = 'sm' }: Props) {
  const emo = resolveEmo(mood);
  if (!emo) return null;

  const dotSize = size === 'md' ? 12 : 8;

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { width: dotSize, height: dotSize, borderRadius: dotSize / 2, backgroundColor: emo.color }]} />
      <Text style={[styles.label, size === 'md' && styles.labelMd]}>{emo.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { flexShrink: 0 },
  label: { fontFamily: 'System', fontSize: 12, color: T.ink2, letterSpacing: 0.2 },
  labelMd: { fontSize: 15, fontFamily: 'Lora_500Medium', color: T.ink },
});
